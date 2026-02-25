import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET /api/admin/ota/[id] - Get single OTA update
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const update = await prisma.deviceOtaUpdate.findUnique({
      where: { id: BigInt(id) },
    });

    if (!update) {
      return NextResponse.json({ error: "OTA update not found" }, { status: 404 });
    }

    // Fetch related data
    const [tenantDevice, firmware] = await Promise.all([
      prisma.tenantDevice.findUnique({ where: { id: update.tenantDeviceId } }),
      prisma.firmwareVersion.findUnique({ where: { id: update.firmwareId } }),
    ]);

    let inventory = null;
    let tenant = null;
    if (tenantDevice) {
      [inventory, tenant] = await Promise.all([
        prisma.deviceInventory.findUnique({
          where: { id: tenantDevice.inventoryId },
          include: { deviceType: true },
        }),
        prisma.tenant.findUnique({
          where: { id: tenantDevice.tenantId },
          select: { companyName: true },
        }),
      ]);
    }

    return NextResponse.json({
      id: update.id.toString(),
      tenantDeviceId: update.tenantDeviceId.toString(),
      deviceNickname: tenantDevice?.nickname || "Unknown",
      deviceSerial: inventory?.serialNumber || "Unknown",
      tenantName: tenant?.companyName || "Unknown",
      deviceType: inventory?.deviceType?.name || "Unknown",
      firmware: firmware ? {
        id: firmware.id.toString(),
        version: firmware.version,
        releaseNotes: firmware.releaseNotes,
        fileUrl: firmware.fileUrl,
        checksum: firmware.checksum,
      } : null,
      status: update.status,
      startedAt: update.startedAt,
      completedAt: update.completedAt,
      errorMessage: update.errorMessage,
      createdAt: update.createdAt,
    });
  } catch (error) {
    logger.error("Error fetching OTA update", {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/ota/[id] - Update OTA status (for device callbacks)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, errorMessage } = body;

    const validStatuses = ["pending", "downloading", "installing", "completed", "failed"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === "downloading" || status === "installing") {
        updateData.startedAt = new Date();
      }
      if (status === "completed" || status === "failed") {
        updateData.completedAt = new Date();
      }
    }
    if (errorMessage !== undefined) {
      updateData.errorMessage = errorMessage;
    }

    const update = await prisma.deviceOtaUpdate.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    // If completed, update device inventory firmware version
    if (status === "completed") {
      const firmware = await prisma.firmwareVersion.findUnique({
        where: { id: update.firmwareId },
      });
      
      if (firmware) {
        const tenantDevice = await prisma.tenantDevice.findUnique({
          where: { id: update.tenantDeviceId },
        });
        
        if (tenantDevice) {
          await prisma.deviceInventory.update({
            where: { id: tenantDevice.inventoryId },
            data: { firmwareVersion: firmware.version },
          });

          logger.info("Device firmware updated", {
            deviceId: update.tenantDeviceId.toString(),
            newVersion: firmware.version,
          });
        }
      }
    }

    return NextResponse.json({
      id: update.id.toString(),
      status: update.status,
      startedAt: update.startedAt,
      completedAt: update.completedAt,
    });
  } catch (error) {
    logger.error("Error updating OTA status", {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/ota/[id] - Cancel OTA update
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const update = await prisma.deviceOtaUpdate.findUnique({
      where: { id: BigInt(id) },
    });

    if (!update) {
      return NextResponse.json({ error: "OTA update not found" }, { status: 404 });
    }

    if (update.status !== "pending") {
      return NextResponse.json(
        { error: "Can only cancel pending updates" },
        { status: 400 }
      );
    }

    await prisma.deviceOtaUpdate.delete({
      where: { id: BigInt(id) },
    });

    logger.info("OTA update cancelled", { otaId: id });

    return NextResponse.json({ success: true, message: "OTA update cancelled" });
  } catch (error) {
    logger.error("Error cancelling OTA update", {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
