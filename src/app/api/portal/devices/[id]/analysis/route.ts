import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { analyzeDeviceTelemetry, generateAnalysisSummary, type DeviceConfig } from "@/lib/ai-analysis";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/portal/devices/[id]/analysis - Get AI analysis for a device
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    // Get device
    const device = await prisma.tenantDevice.findFirst({
      where: {
        id: BigInt(id),
        tenantId,
      },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Get inventory and device type separately
    const inventory = await prisma.deviceInventory.findUnique({
      where: { id: device.inventoryId },
    });

    // Use raw query to get device type since Prisma client may not be regenerated
    const deviceTypes = inventory ? await prisma.$queryRaw<Array<{ id: bigint; category: string }>>`
      SELECT id, category FROM device_types WHERE id = ${inventory.deviceTypeId}
    ` : [];
    const deviceType = deviceTypes[0] || null;

    const variables = deviceType ? await prisma.deviceTypeVariable.findMany({
      where: { deviceTypeId: deviceType.id },
    }) : [];

    // Get telemetry data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const telemetry = await prisma.telemetryKv.findMany({
      where: {
        tenantDeviceId: device.id,
        capturedAt: { gte: sevenDaysAgo },
      },
      orderBy: { capturedAt: "asc" },
    });

    // Build config from device type
    const config: DeviceConfig = {
      deviceTypeCategory: deviceType?.category || "other",
      variables: variables.map((v) => ({
        code: v.variableCode,
        label: v.label,
        unit: v.unit || "",
        minValue: v.minValue ? Number(v.minValue) : undefined,
        maxValue: v.maxValue ? Number(v.maxValue) : undefined,
      })),
    };

    // Convert telemetry to analysis format
    const telemetryPoints = telemetry.map((t) => ({
      variableCode: t.variableCode,
      value: Number(t.value),
      capturedAt: t.capturedAt,
    }));

    // Run analysis
    const result = analyzeDeviceTelemetry(telemetryPoints, config);
    result.deviceId = id;
    result.deviceName = device.nickname || `Device ${id}`;

    // Generate summary
    const summary = generateAnalysisSummary(result);

    return NextResponse.json({
      ...result,
      summary,
      telemetryCount: telemetry.length,
      analysisDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error analyzing device:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
