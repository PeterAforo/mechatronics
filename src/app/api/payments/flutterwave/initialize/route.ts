import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import flutterwave from "@/lib/flutterwave";

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

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.tenantId !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ error: "Order already paid" }, { status: 400 });
    }

    // Get tenant info
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Generate transaction reference
    const txRef = `MEC-${order.orderRef}-${Date.now()}`;
    const baseUrl = process.env.NEXTAUTH_URL || "https://mechatronics.com.gh";

    // Initialize Flutterwave payment
    const response = await flutterwave.initializePayment({
      tx_ref: txRef,
      amount: Number(order.total),
      currency: order.currency,
      redirect_url: `${baseUrl}/api/payments/flutterwave/callback?orderId=${orderId}`,
      customer: {
        email: tenant.email,
        phone_number: tenant.phone || undefined,
        name: tenant.contactName || tenant.companyName,
      },
      customizations: {
        title: "Mechatronics",
        description: `Order #${order.orderRef}`,
        logo: `${baseUrl}/logo.png`,
      },
      meta: {
        orderId: orderId.toString(),
        tenantId: tenantId.toString(),
        orderRef: order.orderRef,
      },
    });

    // Create payment transaction record
    await prisma.paymentTransaction.create({
      data: {
        tenantId,
        orderId: order.id,
        provider: "hubtel", // Using hubtel as closest enum, or we can use "other"
        providerRef: txRef,
        amount: order.total,
        currency: order.currency,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      paymentUrl: response.data.link,
      txRef,
    });
  } catch (error) {
    console.error("Flutterwave initialize error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment initialization failed" },
      { status: 500 }
    );
  }
}
