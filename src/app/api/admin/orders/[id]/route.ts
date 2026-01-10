import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET single order
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id: BigInt(id) },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...order,
    id: order.id.toString(),
    tenantId: order.tenantId.toString(),
  });
}

// PATCH - Update order status (approve/cancel)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, paymentProvider, paymentProviderRef } = body;

  const order = await prisma.order.findUnique({
    where: { id: BigInt(id) },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (action === "approve" || action === "mark_paid") {
    if (order.status === "paid") {
      return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
    }

    // Update order to paid
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        paidAt: new Date(),
        paymentProvider: paymentProvider || "other",
        paymentProviderRef: paymentProviderRef || `ADMIN-${session.user.id}-${Date.now()}`,
      },
    });

    // Process the order - create subscriptions and assign inventory
    const result = await processOrderPayment(order.id, order.tenantId);

    return NextResponse.json({ 
      success: true, 
      message: `Order approved! ${result.subscriptionsCreated} subscription(s) created, ${result.devicesAssigned} device(s) assigned.`,
      status: "paid",
      subscriptionsCreated: result.subscriptionsCreated,
      devicesAssigned: result.devicesAssigned,
    });
  }

  if (action === "cancel") {
    if (order.status === "paid") {
      return NextResponse.json({ error: "Cannot cancel a paid order. Use refund instead." }, { status: 400 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "cancelled",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Order cancelled",
      status: "cancelled"
    });
  }

  if (action === "refund") {
    if (order.status !== "paid") {
      return NextResponse.json({ error: "Can only refund paid orders" }, { status: 400 });
    }

    // Deactivate subscriptions
    await prisma.subscription.updateMany({
      where: { orderId: order.id },
      data: { status: "cancelled" },
    });

    // Release inventory back to stock
    const subscriptions = await prisma.subscription.findMany({
      where: { orderId: order.id },
    });

    for (const sub of subscriptions) {
      const tenantDevice = await prisma.tenantDevice.findFirst({
        where: { subscriptionId: sub.id },
      });

      if (tenantDevice?.inventoryId) {
        await prisma.deviceInventory.update({
          where: { id: tenantDevice.inventoryId },
          data: { status: "in_stock" },
        });

        await prisma.tenantDevice.update({
          where: { id: tenantDevice.id },
          data: { status: "inactive" },
        });
      }
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "refunded",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Order refunded and subscriptions cancelled",
      status: "refunded"
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

/**
 * Process order after payment - creates subscriptions and assigns inventory
 */
async function processOrderPayment(orderId: bigint, tenantId: bigint): Promise<{ subscriptionsCreated: number; devicesAssigned: number }> {
  let subscriptionsCreated = 0;
  let devicesAssigned = 0;

  // Get order items
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
    include: {
      product: true,
    },
  });

  for (const item of orderItems) {
    const product = item.product;
    
    // Create subscription for each quantity
    for (let i = 0; i < item.quantity; i++) {
      // Create subscription
      const subscription = await prisma.subscription.create({
        data: {
          tenantId,
          productId: product.id,
          orderId,
          status: "active",
          currency: product.currency,
          monthlyFee: product.monthlyFee,
          billingInterval: product.billingInterval,
          startDate: new Date(),
          nextBillingDate: getNextBillingDate(product.billingInterval),
        },
      });
      subscriptionsCreated++;

      // Find available inventory for this product's device type
      if (product.deviceTypeId) {
        const availableInventory = await prisma.deviceInventory.findFirst({
          where: {
            deviceTypeId: product.deviceTypeId,
            status: "in_stock",
          },
          orderBy: { createdAt: "asc" },
        });

        if (availableInventory) {
          // Mark inventory as sold
          await prisma.deviceInventory.update({
            where: { id: availableInventory.id },
            data: { status: "sold" },
          });

          // Create tenant device
          await prisma.tenantDevice.create({
            data: {
              tenantId,
              subscriptionId: subscription.id,
              inventoryId: availableInventory.id,
              status: "active",
              installedAt: null,
            },
          });
          devicesAssigned++;
        }
      }
    }
  }

  return { subscriptionsCreated, devicesAssigned };
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
