import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import flutterwave from "@/lib/flutterwave";
import { sendEmail, emailTemplates } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("verif-hash");

    // Step 1: Verify webhook signature
    if (!signature || !flutterwave.verifyWebhookSignature(signature)) {
      logger.warn("Flutterwave webhook: Invalid signature", { signature: signature?.substring(0, 10) });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = await request.json();
    logger.info("Flutterwave webhook received", { event: body.event, txRef: body.data?.tx_ref });

    if (body.event === "charge.completed" && body.data.status === "successful") {
      // Step 2: Verify transaction with Flutterwave API (double verification)
      const transactionId = body.data.id;
      if (!transactionId) {
        logger.warn("Flutterwave webhook: Missing transaction ID");
        return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
      }

      try {
        const verification = await flutterwave.verifyTransaction(String(transactionId));
        
        // Step 3: Verify amounts match
        if (verification.data.status !== "successful") {
          logger.warn("Flutterwave webhook: Transaction not successful on verification", {
            txRef: body.data.tx_ref,
            status: verification.data.status,
          });
          return NextResponse.json({ error: "Transaction verification failed" }, { status: 400 });
        }

        // Step 4: Verify amount matches (prevent amount manipulation)
        if (verification.data.amount !== body.data.amount) {
          logger.error("Flutterwave webhook: Amount mismatch", {
            txRef: body.data.tx_ref,
            webhookAmount: body.data.amount,
            verifiedAmount: verification.data.amount,
          });
          return NextResponse.json({ error: "Amount verification failed" }, { status: 400 });
        }

        await handleSuccessfulCharge(body.data);
      } catch (verifyError) {
        logger.error("Flutterwave webhook: Verification API call failed", {
          txRef: body.data.tx_ref,
        }, verifyError instanceof Error ? verifyError : undefined);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Flutterwave webhook error", {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleSuccessfulCharge(data: {
  id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  charged_amount: number;
  payment_type: string;
  created_at: string;
  meta?: { orderId?: string; tenantId?: string };
}) {
  const { tx_ref, flw_ref, payment_type, created_at, meta } = data;

  // Find payment transaction by tx_ref
  const transaction = await prisma.paymentTransaction.findFirst({
    where: { providerRef: tx_ref },
  });

  if (!transaction) {
    logger.warn("Transaction not found for tx_ref", { txRef: tx_ref });
    return;
  }

  // Check if already processed
  if (transaction.status === "success") {
    logger.debug("Transaction already processed", { txRef: tx_ref });
    return;
  }

  // Update payment transaction
  await prisma.paymentTransaction.update({
    where: { id: transaction.id },
    data: {
      status: "success",
      paymentMethod: payment_type,
      paidAt: new Date(created_at),
      metadata: JSON.stringify(data),
    },
  });

  if (!transaction.orderId) return;

  // Update order
  const order = await prisma.order.update({
    where: { id: transaction.orderId },
    data: {
      status: "paid",
      paymentProvider: "other",
      paymentProviderRef: flw_ref,
      paidAt: new Date(created_at),
    },
    include: {
      items: { include: { product: true } },
    },
  });

  // Create subscriptions and assign devices
  for (const item of order.items) {
    const subscription = await prisma.subscription.create({
      data: {
        tenantId: order.tenantId,
        productId: item.productId,
        orderId: order.id,
        status: "active",
        currency: order.currency,
        monthlyFee: item.monthlyFee,
        billingInterval: item.billingInterval,
        startDate: new Date(),
        nextBillingDate: getNextBillingDate(item.billingInterval),
        paymentProvider: "other",
      },
    });

    const product = item.product;
    if (product.deviceTypeId) {
      for (let i = 0; i < item.quantity; i++) {
        const inventory = await prisma.deviceInventory.findFirst({
          where: {
            deviceTypeId: product.deviceTypeId,
            status: "in_stock",
          },
        });

        if (inventory) {
          await prisma.deviceInventory.update({
            where: { id: inventory.id },
            data: { status: "sold" },
          });

          await prisma.tenantDevice.create({
            data: {
              tenantId: order.tenantId,
              inventoryId: inventory.id,
              subscriptionId: subscription.id,
              nickname: `${product.name} #${i + 1}`,
              status: "active",
            },
          });
        }
      }
    }
  }

  // Send confirmation email
  const tenant = await prisma.tenant.findUnique({
    where: { id: order.tenantId },
  });

  if (tenant) {
    const items = order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: `${order.currency} ${Number(item.lineTotal).toFixed(2)}`,
    }));
    const total = `${order.currency} ${Number(order.total).toFixed(2)}`;
    const template = emailTemplates.orderConfirmation(
      order.orderRef,
      items,
      total,
      tenant.contactName || tenant.companyName
    );

    sendEmail({
      to: tenant.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    }).catch((err) => logger.error("Failed to send order confirmation email", {}, err));
  }

  logger.info("Order paid via Flutterwave webhook", { orderRef: order.orderRef });
}

function getNextBillingDate(interval: string): Date {
  const now = new Date();
  switch (interval) {
    case "monthly":
      return new Date(now.setMonth(now.getMonth() + 1));
    case "quarterly":
      return new Date(now.setMonth(now.getMonth() + 3));
    case "yearly":
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      return new Date(now.setMonth(now.getMonth() + 1));
  }
}
