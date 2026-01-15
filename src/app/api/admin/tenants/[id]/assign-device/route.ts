import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const assignDeviceSchema = z.object({
  inventoryId: z.string().min(1, "Inventory ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  nickname: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tenantId } = await params;
    const body = await req.json();
    const data = assignDeviceSchema.parse(body);

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: BigInt(tenantId) },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Verify inventory exists and is available
    const inventory = await prisma.deviceInventory.findUnique({
      where: { id: BigInt(data.inventoryId) },
      include: { deviceType: true },
    });

    if (!inventory) {
      return NextResponse.json({ error: "Device not found in inventory" }, { status: 404 });
    }

    if (inventory.status !== "in_stock") {
      return NextResponse.json(
        { error: `Device is not available (status: ${inventory.status})` },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.deviceProduct.findUnique({
      where: { id: BigInt(data.productId) },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Create subscription for the device
    const subscription = await prisma.subscription.create({
      data: {
        tenantId: BigInt(tenantId),
        productId: BigInt(data.productId),
        status: "active",
        currency: product.currency,
        monthlyFee: product.monthlyFee,
        billingInterval: product.billingInterval,
        startDate: new Date(),
        nextBillingDate: getNextBillingDate(product.billingInterval),
        paymentProvider: "cash",
        paymentProviderRef: `ADMIN-ASSIGN-${session.user.id}-${Date.now()}`,
      },
    });

    // Update inventory status
    await prisma.deviceInventory.update({
      where: { id: BigInt(data.inventoryId) },
      data: { status: "sold" },
    });

    // Create tenant device
    const tenantDevice = await prisma.tenantDevice.create({
      data: {
        tenantId: BigInt(tenantId),
        subscriptionId: subscription.id,
        inventoryId: BigInt(data.inventoryId),
        nickname: data.nickname || `${inventory.deviceType?.name || "Device"} - ${inventory.serialNumber}`,
        status: "active",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Device assigned successfully",
      device: {
        id: tenantDevice.id.toString(),
        serialNumber: inventory.serialNumber,
        nickname: tenantDevice.nickname,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Assign device error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to assign device" },
      { status: 500 }
    );
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

// GET available inventory and products for assignment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tenantId } = await params;

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: BigInt(tenantId) },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Get available inventory
    const availableInventory = await prisma.deviceInventory.findMany({
      where: { status: "in_stock" },
      include: { deviceType: true },
      orderBy: { createdAt: "desc" },
    });

    // Get published products
    const products = await prisma.deviceProduct.findMany({
      where: { isPublished: true },
      include: { deviceType: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      inventory: availableInventory.map((inv) => ({
        id: inv.id.toString(),
        serialNumber: inv.serialNumber,
        deviceTypeId: inv.deviceTypeId.toString(),
        deviceTypeName: inv.deviceType?.name || "Unknown",
        deviceTypeCode: inv.deviceType?.typeCode || "",
        imei: inv.imei,
        firmwareVersion: inv.firmwareVersion,
      })),
      products: products.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        productCode: p.productCode,
        deviceTypeId: p.deviceTypeId?.toString() || null,
        setupFee: p.setupFee.toString(),
        monthlyFee: p.monthlyFee.toString(),
        currency: p.currency,
      })),
    });
  } catch (error) {
    console.error("Get assignment data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment data" },
      { status: 500 }
    );
  }
}
