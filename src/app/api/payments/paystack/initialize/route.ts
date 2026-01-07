import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import paystack from "@/lib/paystack";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    const body = await request.json();
    const { orderId, callbackUrl } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Get the order
    const order = await prisma.order.findFirst({
      where: {
        id: BigInt(orderId),
        tenantId,
        status: "pending",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get tenant email
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Generate reference
    const reference = `MEC-${order.orderRef}-${Date.now().toString(36)}`.toUpperCase();

    // Initialize Paystack transaction
    const result = await paystack.initializeTransaction({
      email: tenant.email,
      amount: Math.round(Number(order.total) * 100), // Convert to pesewas
      currency: order.currency,
      reference,
      callback_url: callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/portal/orders/${order.id}/callback`,
      metadata: {
        orderId: order.id.toString(),
        orderRef: order.orderRef,
        tenantId: tenantId.toString(),
        items: order.items.map((item) => ({
          productId: item.productId.toString(),
          productName: item.product.name,
          quantity: item.quantity,
        })),
      },
    });

    // Create payment transaction record
    await prisma.paymentTransaction.create({
      data: {
        tenantId,
        orderId: order.id,
        provider: "paystack",
        providerRef: reference,
        amount: order.total,
        currency: order.currency,
        status: "pending",
        metadata: JSON.stringify(result.data),
      },
    });

    return NextResponse.json({
      success: true,
      authorizationUrl: result.data.authorization_url,
      accessCode: result.data.access_code,
      reference: result.data.reference,
    });
  } catch (error) {
    console.error("Paystack initialize error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment initialization failed" },
      { status: 500 }
    );
  }
}
