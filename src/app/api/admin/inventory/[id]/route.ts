import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const item = await prisma.deviceInventory.findUnique({
      where: { id: BigInt(id) },
    });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...item,
      id: item.id.toString(),
      deviceTypeId: item.deviceTypeId.toString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { serialNumber, imei, simNumber, firmwareVersion, status, notes } = body;

    const item = await prisma.deviceInventory.update({
      where: { id: BigInt(id) },
      data: {
        serialNumber,
        imei: imei || null,
        simNumber: simNumber || null,
        firmwareVersion: firmwareVersion || null,
        status: status || "in_stock",
        notes: notes || null,
      },
    });

    return NextResponse.json({
      ...item,
      id: item.id.toString(),
      deviceTypeId: item.deviceTypeId.toString(),
    });
  } catch (error: unknown) {
    console.error("Error updating inventory:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ message: "Serial number already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update inventory item" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.deviceInventory.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Failed to delete inventory item" }, { status: 500 });
  }
}
