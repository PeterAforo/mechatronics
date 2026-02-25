import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = BigInt(session.user.tenantId!);
    const subscriptionId = BigInt(id);

    // Get subscription and verify ownership
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        tenantId,
      },
      include: {
        product: true,
        tenantDevices: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    if (subscription.status === "cancelled") {
      return NextResponse.json(
        { error: "Subscription is already cancelled" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { reason, cancelImmediately = false } = body;

    // Update subscription status
    const endDate = cancelImmediately 
      ? new Date() 
      : subscription.nextBillingDate || new Date();

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "cancelled",
        endDate,
        updatedAt: new Date(),
      },
    });

    // If cancelling immediately, deactivate associated devices
    if (cancelImmediately && subscription.tenantDevices.length > 0) {
      await prisma.tenantDevice.updateMany({
        where: {
          subscriptionId,
        },
        data: {
          status: "suspended",
          updatedAt: new Date(),
        },
      });
    }

    // Log the cancellation
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: BigInt(session.user.id),
        userType: "tenant",
        action: "subscription_cancelled",
        entityType: "Subscription",
        entityId: subscriptionId.toString(),
        newValues: JSON.stringify({
          reason,
          cancelImmediately,
          endDate: endDate.toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: cancelImmediately 
        ? "Subscription cancelled immediately" 
        : `Subscription will be cancelled on ${endDate.toLocaleDateString()}`,
      subscription: {
        id: subscription.id.toString(),
        status: "cancelled",
        endDate: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Subscription cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
