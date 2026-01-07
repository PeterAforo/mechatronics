import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/admin/inventory/import - Bulk import devices from CSV
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { devices, deviceTypeId } = body;

    if (!devices || !Array.isArray(devices) || devices.length === 0) {
      return NextResponse.json({ error: "No devices provided" }, { status: 400 });
    }

    if (!deviceTypeId) {
      return NextResponse.json({ error: "Device type is required" }, { status: 400 });
    }

    // Validate device type exists
    const deviceTypes = await prisma.$queryRaw<Array<{ id: bigint }>>`
      SELECT id FROM device_types WHERE id = ${BigInt(deviceTypeId)}
    `;
    const deviceType = deviceTypes[0] || null;

    if (!deviceType) {
      return NextResponse.json({ error: "Device type not found" }, { status: 404 });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each device
    for (const device of devices) {
      try {
        const { serialNumber, imei, macAddress, notes } = device;

        if (!serialNumber) {
          results.failed++;
          results.errors.push(`Missing serial number for device`);
          continue;
        }

        // Check if serial number already exists
        const existing = await prisma.deviceInventory.findUnique({
          where: { serialNumber },
        });

        if (existing) {
          results.failed++;
          results.errors.push(`Serial number ${serialNumber} already exists`);
          continue;
        }

        // Create inventory item
        await prisma.deviceInventory.create({
          data: {
            deviceTypeId: BigInt(deviceTypeId),
            serialNumber,
            imei: imei || null,
            notes: notes || null,
            status: "in_stock",
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Error processing device: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return NextResponse.json({
      message: `Imported ${results.success} devices, ${results.failed} failed`,
      ...results,
    });
  } catch (error) {
    console.error("Error importing devices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
