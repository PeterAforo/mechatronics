import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/portal/reports - Get report data
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    const reportType = request.nextUrl.searchParams.get("type") || "telemetry_summary";
    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");
    const deviceId = request.nextUrl.searchParams.get("deviceId");

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    switch (reportType) {
      case "telemetry_summary":
        return await getTelemetrySummary(tenantId, dateFilter, deviceId);
      case "alert_history":
        return await getAlertHistory(tenantId, dateFilter, deviceId);
      case "device_status":
        return await getDeviceStatus(tenantId);
      case "billing_summary":
        return await getBillingSummary(tenantId, dateFilter);
      case "usage_analytics":
        return await getUsageAnalytics(tenantId, dateFilter);
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getTelemetrySummary(
  tenantId: bigint,
  dateFilter: { gte?: Date; lte?: Date },
  deviceId: string | null
) {
  const where: Record<string, unknown> = { tenantId };
  if (Object.keys(dateFilter).length > 0) {
    where.capturedAt = dateFilter;
  }
  if (deviceId) {
    where.tenantDeviceId = BigInt(deviceId);
  }

  const telemetry = await prisma.telemetryKv.findMany({
    where,
    orderBy: { capturedAt: "desc" },
    take: 1000,
  });

  // Group by variable code
  const byVariable: Record<string, { count: number; min: number; max: number; avg: number; values: number[] }> = {};
  
  for (const t of telemetry) {
    const code = t.variableCode;
    const value = Number(t.value);
    
    if (!byVariable[code]) {
      byVariable[code] = { count: 0, min: Infinity, max: -Infinity, avg: 0, values: [] };
    }
    
    byVariable[code].count++;
    byVariable[code].min = Math.min(byVariable[code].min, value);
    byVariable[code].max = Math.max(byVariable[code].max, value);
    byVariable[code].values.push(value);
  }

  // Calculate averages
  for (const code of Object.keys(byVariable)) {
    const sum = byVariable[code].values.reduce((a, b) => a + b, 0);
    byVariable[code].avg = sum / byVariable[code].values.length;
    delete (byVariable[code] as Record<string, unknown>).values; // Remove raw values
  }

  return NextResponse.json({
    type: "telemetry_summary",
    totalReadings: telemetry.length,
    byVariable,
    period: {
      start: dateFilter.gte || null,
      end: dateFilter.lte || null,
    },
  });
}

async function getAlertHistory(
  tenantId: bigint,
  dateFilter: { gte?: Date; lte?: Date },
  deviceId: string | null
) {
  const where: Record<string, unknown> = { tenantId };
  if (Object.keys(dateFilter).length > 0) {
    where.createdAt = dateFilter;
  }
  if (deviceId) {
    where.tenantDeviceId = BigInt(deviceId);
  }

  const alerts = await prisma.alert.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  // Group by severity
  const bySeverity = {
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
  };

  // Group by status
  const byStatus = {
    open: alerts.filter((a) => a.status === "open").length,
    acknowledged: alerts.filter((a) => a.status === "acknowledged").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
    closed: alerts.filter((a) => a.status === "closed").length,
  };

  return NextResponse.json({
    type: "alert_history",
    totalAlerts: alerts.length,
    bySeverity,
    byStatus,
    recentAlerts: alerts.slice(0, 20).map((a) => ({
      id: a.id.toString(),
      title: a.title,
      severity: a.severity,
      status: a.status,
      createdAt: a.createdAt,
    })),
  });
}

async function getDeviceStatus(tenantId: bigint) {
  const devices = await prisma.tenantDevice.findMany({
    where: { tenantId },
    include: {
      inventory: {
        include: {
          deviceType: true,
        },
      },
    },
  });

  const byStatus = {
    active: devices.filter((d) => d.status === "active").length,
    inactive: devices.filter((d) => d.status === "inactive").length,
    suspended: devices.filter((d) => d.status === "suspended").length,
    retired: devices.filter((d) => d.status === "retired").length,
  };

  const byType: Record<string, number> = {};
  for (const d of devices) {
    const typeName = d.inventory?.deviceType?.name || "Unknown";
    byType[typeName] = (byType[typeName] || 0) + 1;
  }

  return NextResponse.json({
    type: "device_status",
    totalDevices: devices.length,
    byStatus,
    byType,
    devices: devices.map((d) => ({
      id: d.id.toString(),
      name: d.deviceName,
      status: d.status,
      type: d.inventory?.deviceType?.name || "Unknown",
      lastSeen: d.lastSeenAt,
    })),
  });
}

async function getBillingSummary(
  tenantId: bigint,
  dateFilter: { gte?: Date; lte?: Date }
) {
  const where: Record<string, unknown> = { tenantId };
  if (Object.keys(dateFilter).length > 0) {
    where.createdAt = dateFilter;
  }

  const [orders, subscriptions] = await Promise.all([
    prisma.order.findMany({
      where: { ...where, status: "paid" },
    }),
    prisma.subscription.findMany({
      where: { tenantId, status: "active" },
    }),
  ]);

  const totalPaid = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const monthlyRecurring = subscriptions.reduce((sum, s) => sum + Number(s.monthlyFee), 0);

  return NextResponse.json({
    type: "billing_summary",
    totalOrders: orders.length,
    totalPaid,
    activeSubscriptions: subscriptions.length,
    monthlyRecurring,
    currency: "GHS",
  });
}

async function getUsageAnalytics(
  tenantId: bigint,
  dateFilter: { gte?: Date; lte?: Date }
) {
  const where: Record<string, unknown> = { tenantId };
  if (Object.keys(dateFilter).length > 0) {
    where.capturedAt = dateFilter;
  }

  const [telemetryCount, alertCount, deviceCount, siteCount] = await Promise.all([
    prisma.telemetryKv.count({ where }),
    prisma.alert.count({ where: { tenantId, createdAt: dateFilter.gte ? { gte: dateFilter.gte, lte: dateFilter.lte } : undefined } }),
    prisma.tenantDevice.count({ where: { tenantId } }),
    prisma.tenantSite.count({ where: { tenantId } }),
  ]);

  return NextResponse.json({
    type: "usage_analytics",
    telemetryReadings: telemetryCount,
    alertsGenerated: alertCount,
    totalDevices: deviceCount,
    totalSites: siteCount,
    period: {
      start: dateFilter.gte || null,
      end: dateFilter.lte || null,
    },
  });
}
