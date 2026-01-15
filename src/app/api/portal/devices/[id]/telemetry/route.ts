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
  const url = new URL(req.url);
  const hours = parseInt(url.searchParams.get("hours") || "24");
  const limit = parseInt(url.searchParams.get("limit") || "100");

  // Verify device belongs to tenant
  const device = await prisma.tenantDevice.findFirst({
    where: {
      id: BigInt(id),
      tenantId,
    },
    include: {
      inventory: true,
    },
  });

  if (!device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  // Get device type and variables
  const deviceType = device.inventory?.deviceTypeId
    ? await prisma.deviceType.findUnique({
        where: { id: device.inventory.deviceTypeId },
      })
    : null;

  const variables = deviceType
    ? await prisma.deviceTypeVariable.findMany({
        where: { deviceTypeId: deviceType.id },
        orderBy: { displayOrder: "asc" },
      })
    : [];

  // Get telemetry data
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const telemetry = await prisma.telemetryKv.findMany({
    where: {
      tenantDeviceId: device.id,
      capturedAt: { gte: since },
    },
    orderBy: { capturedAt: "desc" },
    take: limit,
  });

  // Get latest reading for each variable
  const latestReadings: Record<string, { value: number; capturedAt: Date }> = {};
  
  for (const reading of telemetry) {
    if (!latestReadings[reading.variableCode]) {
      latestReadings[reading.variableCode] = {
        value: Number(reading.value),
        capturedAt: reading.capturedAt,
      };
    }
  }

  // Group telemetry by variable for charts
  const chartData: Record<string, Array<{ time: string; value: number }>> = {};
  
  for (const reading of telemetry.reverse()) {
    const code = reading.variableCode;
    if (!chartData[code]) {
      chartData[code] = [];
    }
    chartData[code].push({
      time: reading.capturedAt.toISOString(),
      value: Number(reading.value),
    });
  }

  // Calculate stats for each variable
  const stats: Record<string, { min: number; max: number; avg: number; count: number }> = {};
  
  for (const [code, readings] of Object.entries(chartData)) {
    const values = readings.map(r => r.value);
    stats[code] = {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
    };
  }

  return NextResponse.json({
    device: {
      id: device.id.toString(),
      nickname: device.nickname,
      status: device.status,
      lastSeenAt: device.lastSeenAt?.toISOString(),
      serialNumber: device.inventory?.serialNumber,
    },
    deviceType: deviceType ? {
      id: deviceType.id.toString(),
      name: deviceType.name,
      category: deviceType.category,
    } : null,
    variables: variables.map(v => ({
      code: v.variableCode,
      label: v.label,
      unit: v.unit,
      category: v.variableCategory,
      minValue: v.minValue ? Number(v.minValue) : null,
      maxValue: v.maxValue ? Number(v.maxValue) : null,
      widget: v.displayWidget,
      isAlertable: v.isAlertable,
    })),
    latestReadings,
    chartData,
    stats,
    totalReadings: telemetry.length,
  });
}
