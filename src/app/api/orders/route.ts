import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateOrderRef } from "@/lib/utils/generators";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
  
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant associated" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  return NextResponse.json(orders.map(order => ({
    ...order,
    id: order.id.toString(),
    tenantId: order.tenantId.toString(),
    subtotal: order.subtotal.toString(),
    discount: order.discount.toString(),
    tax: order.tax.toString(),
    total: order.total.toString(),
    items: order.items.map(item => ({
      ...item,
      id: item.id.toString(),
      orderId: item.orderId.toString(),
      productId: item.productId.toString(),
      setupFee: item.setupFee.toString(),
      monthlyFee: item.monthlyFee.toString(),
      lineTotal: item.lineTotal.toString(),
      product: {
        ...item.product,
        id: item.product.id.toString(),
        setupFee: item.product.setupFee.toString(),
        monthlyFee: item.product.monthlyFee.toString(),
      },
    })),
  })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
  
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant associated. Please register first." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ message: "Product is required" }, { status: 400 });
    }

    // Get product details
    const product = await prisma.deviceProduct.findUnique({
      where: { id: BigInt(productId) },
    });

    if (!product || !product.isPublished) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const setupFee = Number(product.setupFee);
    const monthlyFee = Number(product.monthlyFee);
    const lineTotal = (setupFee + monthlyFee) * quantity;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        tenantId,
        orderRef: generateOrderRef(),
        status: "pending",
        currency: product.currency,
        subtotal: lineTotal,
        discount: 0,
        tax: 0,
        total: lineTotal,
        items: {
          create: {
            productId: product.id,
            quantity,
            setupFee: product.setupFee,
            monthlyFee: product.monthlyFee,
            billingInterval: product.billingInterval,
            lineTotal,
          },
        },
      },
      include: {
        items: true,
      },
    });

    // Order is created as pending - admin will approve after payment verification
    return NextResponse.json({
      id: order.id.toString(),
      orderRef: order.orderRef,
      status: order.status,
      total: order.total.toString(),
      message: "Order placed successfully. Awaiting payment confirmation.",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
  }
}

