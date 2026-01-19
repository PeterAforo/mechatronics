import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const device = await prisma.tenantDevice.findUnique({
      where: { id: BigInt(id) },
      include: {
        inventory: {
          include: {
            deviceType: true,
          },
        },
        subscription: {
          include: {
            product: true,
          },
        },
        provisioningProfile: true,
      },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Fetch tenant separately using tenantId from subscription
    const tenant = await prisma.tenant.findUnique({
      where: { id: device.subscription.tenantId },
      select: {
        id: true,
        companyName: true,
        email: true,
      },
    });

    // Combine device with tenant info
    const deviceWithTenant = {
      ...device,
      subscription: {
        ...device.subscription,
        tenant,
      },
    };

    // Serialize BigInt values
    const serialized = JSON.parse(
      JSON.stringify(deviceWithTenant, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Error fetching device:", error);
    return NextResponse.json(
      { error: "Failed to fetch device" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const device = await prisma.tenantDevice.update({
      where: { id: BigInt(id) },
      data: {
        nickname: body.nickname || null,
        status: body.status,
        siteId: body.siteId ? BigInt(body.siteId) : null,
        zoneId: body.zoneId ? BigInt(body.zoneId) : null,
      },
      include: {
        inventory: {
          include: {
            deviceType: true,
          },
        },
        subscription: {
          include: {
            product: true,
          },
        },
      },
    });

    const serialized = JSON.parse(
      JSON.stringify(device, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Error updating device:", error);
    return NextResponse.json(
      { error: "Failed to update device" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.tenantDevice.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting device:", error);
    return NextResponse.json(
      { error: "Failed to delete device" },
      { status: 500 }
    );
  }
}
