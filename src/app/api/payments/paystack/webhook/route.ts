import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import paystack from "@/lib/paystack";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Verify webhook signature
    if (!paystack.verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("Paystack webhook event:", event.event);

    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;
      case "charge.failed":
        await handleChargeFailed(event.data);
        break;
      case "subscription.create":
        await handleSubscriptionCreate(event.data);
        break;
      case "subscription.disable":
        await handleSubscriptionDisable(event.data);
        break;
      default:
        console.log("Unhandled Paystack event:", event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleChargeSuccess(data: {
  reference: string;
  amount: number;
  currency: string;
  paid_at: string;
  channel: string;
  metadata?: { orderId?: string; tenantId?: string };
}) {
  const { reference, amount, paid_at, channel, metadata } = data;

  // Update payment transaction
  const transaction = await prisma.paymentTransaction.findFirst({
    where: { providerRef: reference },
  });

  if (transaction) {
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "success",
        paymentMethod: channel,
        paidAt: new Date(paid_at),
      },
    });

    // Update order status
    if (transaction.orderId) {
      const order = await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          status: "paid",
          paymentProvider: "paystack",
          paymentProviderRef: reference,
          paidAt: new Date(paid_at),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Create subscriptions and assign devices for each order item
      for (const item of order.items) {
        // Create subscription
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
            paymentProvider: "paystack",
          },
        });

        // Find and assign available inventory
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
              // Update inventory status
              await prisma.deviceInventory.update({
                where: { id: inventory.id },
                data: { status: "sold" },
              });

              // Create tenant device
              await prisma.tenantDevice.create({
                data: {
                  tenantId: order.tenantId,
                  inventoryId: inventory.id,
                  subscriptionId: subscription.id,
                  deviceName: `${product.name} #${i + 1}`,
                  status: "active",
                },
              });
            }
          }
        }
      }

      console.log(`Order ${order.orderRef} paid and processed`);
    }
  }
}

async function handleChargeFailed(data: {
  reference: string;
  gateway_response: string;
}) {
  const { reference, gateway_response } = data;

  await prisma.paymentTransaction.updateMany({
    where: { providerRef: reference },
    data: {
      status: "failed",
      failureReason: gateway_response,
    },
  });

  // Update order status
  const transaction = await prisma.paymentTransaction.findFirst({
    where: { providerRef: reference },
  });

  if (transaction?.orderId) {
    await prisma.order.update({
      where: { id: transaction.orderId },
      data: { status: "failed" },
    });
  }
}

async function handleSubscriptionCreate(data: {
  subscription_code: string;
  customer: { email: string };
  plan: { plan_code: string };
}) {
  console.log("Subscription created:", data.subscription_code);
}

async function handleSubscriptionDisable(data: {
  subscription_code: string;
}) {
  console.log("Subscription disabled:", data.subscription_code);
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
