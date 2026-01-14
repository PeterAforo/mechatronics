import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey, hasScope, apiError, apiSuccess } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return apiError("Invalid or missing API key", 401);
  }

  if (!hasScope(auth, "read") && !hasScope(auth, "reports:read")) {
    return apiError("Insufficient permissions", 403);
  }

  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get("type") || "summary";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  if (reportType === "summary") {
    const [devices, alerts, telemetryCount] = await Promise.all([
      prisma.tenantDevice.groupBy({
        by: ["status"],
        where: { tenantId: auth.tenantId },
        _count: { id: true },
      }),
      prisma.alert.groupBy({
        by: ["severity", "status"],
        where: { tenantId: auth.tenantId, createdAt: { gte: start, lte: end } },
        _count: { id: true },
      }),
      prisma.telemetryKv.count({
        where: { tenantId: auth.tenantId, capturedAt: { gte: start, lte: end } },
      }),
    ]);

    return apiSuccess({
      reportType: "summary",
      period: { start, end },
      devices: devices.map(d => ({ status: d.status, count: d._count.id })),
      alerts: alerts.map(a => ({ severity: a.severity, status: a.status, count: a._count.id })),
      telemetryDataPoints: telemetryCount,
    });
  }

  if (reportType === "telemetry") {
    const deviceId = searchParams.get("deviceId");
    if (!deviceId) {
      return apiError("deviceId required for telemetry report");
    }

    const telemetry = await prisma.telemetryKv.groupBy({
      by: ["variableCode"],
      where: {
        tenantId: auth.tenantId,
        tenantDeviceId: BigInt(deviceId),
        capturedAt: { gte: start, lte: end },
      },
      _avg: { value: true },
      _min: { value: true },
      _max: { value: true },
      _count: { id: true },
    });

    return apiSuccess({
      reportType: "telemetry",
      deviceId,
      period: { start, end },
      variables: telemetry.map(t => ({
        variable: t.variableCode,
        avg: Number(t._avg.value),
        min: Number(t._min.value),
        max: Number(t._max.value),
        count: t._count.id,
      })),
    });
  }

  return apiError("Invalid report type. Use: summary, telemetry");
}
