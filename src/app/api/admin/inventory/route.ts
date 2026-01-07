import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateSerialNumber, generateIMEI, generateSIMNumber } from "@/lib/utils/generators";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inventory = await prisma.deviceInventory.findMany({
    orderBy: { createdAt: "desc" },
    include: { deviceType: true },
  });

  return NextResponse.json(inventory.map(item => ({
    ...item,
    id: item.id.toString(),
    deviceTypeId: item.deviceTypeId.toString(),
    deviceType: item.deviceType ? {
      ...item.deviceType,
      id: item.deviceType.id.toString(),
    } : null,
  })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { deviceTypeId, quantity = 1, firmwareVersion, notes, autoGenerate = true } = body;

    if (!deviceTypeId) {
      return NextResponse.json({ message: "Device type is required" }, { status: 400 });
    }

    // Get device type for serial number prefix
    const deviceType = await prisma.deviceType.findUnique({
      where: { id: BigInt(deviceTypeId) },
    });

    if (!deviceType) {
      return NextResponse.json({ message: "Device type not found" }, { status: 400 });
    }

    // Get current count for sequence
    const currentCount = await prisma.deviceInventory.count({
      where: { deviceTypeId: BigInt(deviceTypeId) },
    });

    const createdItems = [];

    for (let i = 0; i < quantity; i++) {
      const sequence = currentCount + i + 1;
      const serialNumber = autoGenerate 
        ? generateSerialNumber(deviceType.typeCode, sequence)
        : body.serialNumber;
      
      const item = await prisma.deviceInventory.create({
        data: {
          deviceTypeId: BigInt(deviceTypeId),
          serialNumber,
          imei: autoGenerate ? generateIMEI() : (body.imei || null),
          simNumber: autoGenerate ? generateSIMNumber() : (body.simNumber || null),
          firmwareVersion: firmwareVersion || deviceType.firmwareVersion || "v1.0.0",
          notes: notes || null,
          status: "in_stock",
        },
      });

      createdItems.push({
        ...item,
        id: item.id.toString(),
        deviceTypeId: item.deviceTypeId.toString(),
      });
    }

    return NextResponse.json(createdItems.length === 1 ? createdItems[0] : createdItems);
  } catch (error: unknown) {
    console.error("Error adding inventory:", error);
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      return NextResponse.json({ message: "Serial number already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to add inventory" }, { status: 500 });
  }
}
