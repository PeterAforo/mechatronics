import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey, hasScope, apiError, apiSuccess } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return apiError("Invalid or missing API key", 401);
  }

  if (!hasScope(auth, "read") && !hasScope(auth, "alerts:read")) {
    return apiError("Insufficient permissions", 403);
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const severity = searchParams.get("severity");
  const deviceId = searchParams.get("deviceId");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Record<string, unknown> = { tenantId: auth.tenantId };
  if (status) where.status = status;
  if (severity) where.severity = severity;
  if (deviceId) where.tenantDeviceId = BigInt(deviceId);

  const [alerts, total] = await Promise.all([
    prisma.alert.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    }),
    prisma.alert.count({ where }),
  ]);

  const serialized = alerts.map(a => ({
    id: a.id.toString(),
    deviceId: a.tenantDeviceId.toString(),
    title: a.title,
    message: a.message,
    severity: a.severity,
    status: a.status,
    variable: a.variableCode,
    value: Number(a.value),
    createdAt: a.createdAt,
    resolvedAt: a.resolvedAt,
  }));

  return apiSuccess({
    alerts: serialized,
    pagination: { total, limit, offset },
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return apiError("Invalid or missing API key", 401);
  }

  if (!hasScope(auth, "write") && !hasScope(auth, "alerts:write")) {
    return apiError("Insufficient permissions", 403);
  }

  try {
    const body = await request.json();
    const { alertId, status } = body;

    if (!alertId || !status) {
      return apiError("alertId and status required");
    }

    const alert = await prisma.alert.findFirst({
      where: { id: BigInt(alertId), tenantId: auth.tenantId },
    });

    if (!alert) {
      return apiError("Alert not found", 404);
    }

    const updated = await prisma.alert.update({
      where: { id: alert.id },
      data: {
        status,
        resolvedAt: status === "resolved" ? new Date() : null,
      },
    });

    return apiSuccess({
      id: updated.id.toString(),
      status: updated.status,
      resolvedAt: updated.resolvedAt,
    });
  } catch {
    return apiError("Invalid request body");
  }
}
