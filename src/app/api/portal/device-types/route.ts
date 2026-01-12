import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
    
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Get device types that the tenant has devices for
    const tenantDevices = await prisma.tenantDevice.findMany({
      where: { tenantId },
      include: {
        inventory: {
          include: {
            deviceType: {
              include: {
                variables: true,
              },
            },
          },
        },
      },
    });

    // Extract unique device types
    const deviceTypeMap = new Map();
    for (const device of tenantDevices) {
      const dt = device.inventory?.deviceType;
      if (dt && !deviceTypeMap.has(dt.id.toString())) {
        deviceTypeMap.set(dt.id.toString(), {
          id: dt.id.toString(),
          typeCode: dt.typeCode,
          name: dt.name,
          category: dt.category,
          variables: dt.variables.map(v => ({
            variableCode: v.variableCode,
            label: v.label,
            unit: v.unit,
          })),
        });
      }
    }

    // If tenant has no devices yet, return all device types so they can create rules
    if (deviceTypeMap.size === 0) {
      const allDeviceTypes = await prisma.deviceType.findMany({
        include: {
          variables: true,
        },
        orderBy: { name: "asc" },
      });

      return NextResponse.json(
        allDeviceTypes.map(dt => ({
          id: dt.id.toString(),
          typeCode: dt.typeCode,
          name: dt.name,
          category: dt.category,
          variables: dt.variables.map(v => ({
            variableCode: v.variableCode,
            label: v.label,
            unit: v.unit,
          })),
        }))
      );
    }

    return NextResponse.json(Array.from(deviceTypeMap.values()));
  } catch (error) {
    console.error("Error fetching device types:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
