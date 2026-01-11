import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import flutterwave from "@/lib/flutterwave";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const txRef = searchParams.get("tx_ref");
    const transactionId = searchParams.get("transaction_id");
    const orderId = searchParams.get("orderId");

    const baseUrl = process.env.NEXTAUTH_URL || "https://mechatronics.com.gh";

    if (status !== "successful" || !transactionId) {
      // Payment failed or cancelled
      return NextResponse.redirect(`${baseUrl}/order?status=failed&orderId=${orderId}`);
    }

    // Verify the transaction
    const verification = await flutterwave.verifyTransaction(transactionId);

    if (verification.data.status !== "successful") {
      return NextResponse.redirect(`${baseUrl}/order?status=failed&orderId=${orderId}`);
    }

    // Find the payment transaction
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { providerRef: txRef || undefined },
    });

    if (!transaction || !transaction.orderId) {
      return NextResponse.redirect(`${baseUrl}/order?status=error&message=Transaction not found`);
    }

    // Update payment transaction
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "success",
        paymentMethod: verification.data.payment_type,
        paidAt: new Date(verification.data.created_at),
        metadata: JSON.stringify(verification.data),
      },
    });

    // Update order status
    const order = await prisma.order.update({
      where: { id: transaction.orderId },
      data: {
        status: "paid",
        paymentProvider: "other", // Flutterwave
        paymentProviderRef: transactionId,
        paidAt: new Date(),
      },
      include: {
        items: {
          include: { product: true },
        },
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

      // Assign inventory
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

    // Send order confirmation email
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
      }).catch(console.error);
    }

    // Redirect to success page
    return NextResponse.redirect(`${baseUrl}/order?status=success&orderId=${orderId}`);
  } catch (error) {
    console.error("Flutterwave callback error:", error);
    const baseUrl = process.env.NEXTAUTH_URL || "https://mechatronics.com.gh";
    return NextResponse.redirect(`${baseUrl}/order?status=error&message=Payment verification failed`);
  }
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
