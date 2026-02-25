import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET /api/admin/ota - Get all OTA updates
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.status = status;

    const updates = await prisma.deviceOtaUpdate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    if (updates.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch related data separately since DeviceOtaUpdate doesn't have relations
    const tenantDeviceIds = [...new Set(updates.map((u) => u.tenantDeviceId))];
    const firmwareIds = [...new Set(updates.map((u) => u.firmwareId))];

    const [tenantDevices, firmwares, inventories, tenants] = await Promise.all([
      prisma.tenantDevice.findMany({
        where: { id: { in: tenantDeviceIds } },
      }),
      prisma.firmwareVersion.findMany({
        where: { id: { in: firmwareIds } },
      }),
      prisma.deviceInventory.findMany({
        where: { 
          id: { 
            in: (await prisma.tenantDevice.findMany({
              where: { id: { in: tenantDeviceIds } },
              select: { inventoryId: true },
            })).map(d => d.inventoryId)
          } 
        },
        include: { deviceType: true },
      }),
      prisma.tenant.findMany({
        where: {
          id: {
            in: (await prisma.tenantDevice.findMany({
              where: { id: { in: tenantDeviceIds } },
              select: { tenantId: true },
            })).map(d => d.tenantId)
          }
        },
        select: { id: true, companyName: true },
      }),
    ]);

    const deviceMap = new Map(tenantDevices.map((d) => [d.id.toString(), d]));
    const firmwareMap = new Map(firmwares.map((f) => [f.id.toString(), f]));
    const inventoryMap = new Map(inventories.map((i) => [i.id.toString(), i]));
    const tenantMap = new Map(tenants.map((t) => [t.id.toString(), t]));

    return NextResponse.json(
      updates.map((u) => {
        const device = deviceMap.get(u.tenantDeviceId.toString());
        const firmware = firmwareMap.get(u.firmwareId.toString());
        const inventory = device ? inventoryMap.get(device.inventoryId.toString()) : null;
        const tenant = device ? tenantMap.get(device.tenantId.toString()) : null;
        return {
          id: u.id.toString(),
          tenantDeviceId: u.tenantDeviceId.toString(),
          deviceNickname: device?.nickname || "Unknown",
          deviceSerial: inventory?.serialNumber || "Unknown",
          tenantName: tenant?.companyName || "Unknown",
          deviceType: inventory?.deviceType?.name || "Unknown",
          firmwareVersion: firmware?.version || "Unknown",
          status: u.status,
          startedAt: u.startedAt,
          completedAt: u.completedAt,
          errorMessage: u.errorMessage,
          createdAt: u.createdAt,
        };
      })
    );
  } catch (error) {
    logger.error("Error fetching OTA updates", {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/ota - Push OTA update to devices
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firmwareId, deviceIds, pushToAll, deviceTypeId } = body;

    if (!firmwareId) {
      return NextResponse.json({ error: "Firmware ID is required" }, { status: 400 });
    }

    // Verify firmware exists
    const firmware = await prisma.firmwareVersion.findUnique({
      where: { id: BigInt(firmwareId) },
    });

    if (!firmware) {
      return NextResponse.json({ error: "Firmware not found" }, { status: 404 });
    }

    let targetDeviceIds: bigint[] = [];

    if (pushToAll && deviceTypeId) {
      // Push to all devices of a specific device type via inventory
      const inventoryIds = await prisma.deviceInventory.findMany({
        where: { deviceTypeId: BigInt(deviceTypeId) },
        select: { id: true },
      });
      
      const devices = await prisma.tenantDevice.findMany({
        where: {
          inventoryId: { in: inventoryIds.map(i => i.id) },
          status: "active",
        },
        select: { id: true },
      });
      targetDeviceIds = devices.map(d => d.id);
    } else if (deviceIds && deviceIds.length > 0) {
      // Push to specific devices
      const devices = await prisma.tenantDevice.findMany({
        where: {
          id: { in: deviceIds.map((id: string) => BigInt(id)) },
          status: "active",
        },
        select: { id: true },
      });
      targetDeviceIds = devices.map(d => d.id);
    } else {
      return NextResponse.json(
        { error: "Either deviceIds or pushToAll with deviceTypeId is required" },
        { status: 400 }
      );
    }

    if (targetDeviceIds.length === 0) {
      return NextResponse.json({ error: "No active devices found" }, { status: 404 });
    }

    // Check for existing pending updates
    const existingUpdates = await prisma.deviceOtaUpdate.findMany({
      where: {
        tenantDeviceId: { in: targetDeviceIds },
        status: { in: ["pending", "downloading", "installing"] },
      },
      select: { tenantDeviceId: true },
    });

    const devicesWithPendingUpdates = new Set(existingUpdates.map((u) => u.tenantDeviceId.toString()));
    const devicesToUpdate = targetDeviceIds.filter(
      (id) => !devicesWithPendingUpdates.has(id.toString())
    );

    if (devicesToUpdate.length === 0) {
      return NextResponse.json(
        { error: "All selected devices already have pending updates" },
        { status: 400 }
      );
    }

    // Create OTA update records
    const otaUpdates = await prisma.deviceOtaUpdate.createMany({
      data: devicesToUpdate.map((deviceId) => ({
        tenantDeviceId: deviceId,
        firmwareId: BigInt(firmwareId),
        status: "pending" as const,
      })),
    });

    logger.info("OTA updates created", {
      firmwareId,
      firmwareVersion: firmware.version,
      deviceCount: otaUpdates.count,
      skippedCount: targetDeviceIds.length - devicesToUpdate.length,
    });

    return NextResponse.json({
      success: true,
      message: `OTA update queued for ${otaUpdates.count} devices`,
      totalDevices: targetDeviceIds.length,
      updatedDevices: otaUpdates.count,
      skippedDevices: targetDeviceIds.length - devicesToUpdate.length,
    });
  } catch (error) {
    logger.error("Error creating OTA updates", {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
