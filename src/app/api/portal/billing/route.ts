import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = BigInt(session.user.tenantId!);

    // Get all payment transactions
    const transactions = await prisma.paymentTransaction.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Get all orders
    const orders = await prisma.order.findMany({
      where: { tenantId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Get active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { tenantId },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate billing summary
    const totalSpent = orders
      .filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + Number(o.total), 0);

    const monthlyRecurring = subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + Number(s.monthlyFee), 0);

    return NextResponse.json({
      summary: {
        totalSpent,
        monthlyRecurring,
        activeSubscriptions: subscriptions.filter((s) => s.status === "active").length,
        pendingPayments: transactions.filter((t) => t.status === "pending").length,
      },
      transactions: transactions.map((t) => ({
        id: t.id.toString(),
        amount: Number(t.amount),
        currency: t.currency,
        status: t.status,
        provider: t.provider,
        providerRef: t.providerRef,
        createdAt: t.createdAt.toISOString(),
        paidAt: t.paidAt?.toISOString() || null,
      })),
      orders: orders.map((o) => ({
        id: o.id.toString(),
        orderRef: o.orderRef,
        status: o.status,
        total: Number(o.total),
        currency: o.currency,
        createdAt: o.createdAt.toISOString(),
        paidAt: o.paidAt?.toISOString() || null,
        items: o.items.map((i) => ({
          productName: i.product.name,
          quantity: i.quantity,
          lineTotal: Number(i.lineTotal),
        })),
      })),
      subscriptions: subscriptions.map((s) => ({
        id: s.id.toString(),
        productName: s.product.name,
        status: s.status,
        monthlyFee: Number(s.monthlyFee),
        currency: s.currency,
        billingInterval: s.billingInterval,
        startDate: s.startDate.toISOString(),
        nextBillingDate: s.nextBillingDate?.toISOString() || null,
        endDate: s.endDate?.toISOString() || null,
      })),
    });
  } catch (error) {
    console.error("Billing fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing information" },
      { status: 500 }
    );
  }
}
