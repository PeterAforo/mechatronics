import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/payments - Get all payment transactions
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payments = await prisma.paymentTransaction.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Get tenant names
    const tenantIds = [...new Set(payments.map((p) => p.tenantId))];
    const tenants = await prisma.tenant.findMany({
      where: { id: { in: tenantIds } },
      select: { id: true, companyName: true },
    });
    const tenantMap = new Map(tenants.map((t) => [t.id.toString(), t.companyName]));

    // Get order refs
    const orderIds = payments.filter((p) => p.orderId).map((p) => p.orderId as bigint);
    const orders = orderIds.length > 0 
      ? await prisma.order.findMany({
          where: { id: { in: orderIds } },
          select: { id: true, orderRef: true },
        })
      : [];
    const orderMap = new Map(orders.map((o) => [o.id.toString(), o.orderRef]));

    return NextResponse.json(
      payments.map((p) => ({
        id: p.id.toString(),
        tenantId: p.tenantId.toString(),
        tenantName: tenantMap.get(p.tenantId.toString()) || "Unknown",
        orderId: p.orderId?.toString() || null,
        orderRef: p.orderId ? orderMap.get(p.orderId.toString()) || null : null,
        provider: p.provider,
        providerRef: p.providerRef,
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        paymentMethod: p.paymentMethod,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
