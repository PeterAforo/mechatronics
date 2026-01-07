import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "tenant") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 400 });
  }

  const { id } = await params;

  const device = await prisma.tenantDevice.findFirst({
    where: {
      id: BigInt(id),
      tenantId,
    },
    include: {
      inventory: true,
      subscription: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: device.id.toString(),
    nickname: device.nickname,
    serialNumber: device.inventory?.serialNumber || "",
    productName: device.subscription?.product?.name || "",
    status: device.status,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "tenant") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 400 });
  }

  const { id } = await params;
  const body = await req.json();
  const { nickname } = body;

  // Verify device belongs to tenant
  const device = await prisma.tenantDevice.findFirst({
    where: {
      id: BigInt(id),
      tenantId,
    },
  });

  if (!device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  // Update device
  const updated = await prisma.tenantDevice.update({
    where: { id: device.id },
    data: {
      nickname: nickname || null,
    },
  });

  return NextResponse.json({
    id: updated.id.toString(),
    nickname: updated.nickname,
    success: true,
  });
}
