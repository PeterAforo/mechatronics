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
    const deviceType = await prisma.deviceType.findUnique({
      where: { id: BigInt(id) },
    });

    if (!deviceType) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...deviceType,
      id: deviceType.id.toString(),
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
    const { typeCode, name, description, category, manufacturer, communicationProtocol, isActive } = body;

    const deviceType = await prisma.deviceType.update({
      where: { id: BigInt(id) },
      data: {
        typeCode,
        name,
        description: description || null,
        category: category || "other",
        manufacturer: manufacturer || null,
        communicationProtocol: communicationProtocol || "sms",
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({
      ...deviceType,
      id: deviceType.id.toString(),
    });
  } catch (error: unknown) {
    console.error("Error updating device type:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ message: "Type code already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update device type" }, { status: 500 });
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
    await prisma.deviceType.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Failed to delete device type" }, { status: 500 });
  }
}
