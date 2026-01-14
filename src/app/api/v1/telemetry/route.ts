import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey, hasScope, apiError, apiSuccess } from "@/lib/api-auth";
import { getTelemetryTimestamp, parseAccraDate } from "@/lib/timezone";

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return apiError("Invalid or missing API key", 401);
  }

  if (!hasScope(auth, "read") && !hasScope(auth, "telemetry:read")) {
    return apiError("Insufficient permissions", 403);
  }

  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");
  const variableCode = searchParams.get("variable");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 1000);
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Record<string, unknown> = { tenantId: auth.tenantId };
  
  if (deviceId) {
    where.tenantDeviceId = BigInt(deviceId);
  }
  if (variableCode) {
    where.variableCode = variableCode;
  }
  if (startDate) {
    where.capturedAt = { ...(where.capturedAt as object || {}), gte: new Date(startDate) };
  }
  if (endDate) {
    where.capturedAt = { ...(where.capturedAt as object || {}), lte: new Date(endDate) };
  }

  const [telemetry, total] = await Promise.all([
    prisma.telemetryKv.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { capturedAt: "desc" },
    }),
    prisma.telemetryKv.count({ where }),
  ]);

  const serialized = telemetry.map(t => ({
    id: t.id.toString(),
    deviceId: t.tenantDeviceId.toString(),
    variable: t.variableCode,
    value: Number(t.value),
    capturedAt: t.capturedAt,
  }));

  return apiSuccess({
    telemetry: serialized,
    pagination: { total, limit, offset },
  });
}

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return apiError("Invalid or missing API key", 401);
  }

  if (!hasScope(auth, "write") && !hasScope(auth, "telemetry:write")) {
    return apiError("Insufficient permissions", 403);
  }

  try {
    const body = await request.json();
    const { deviceId, readings } = body;

    if (!deviceId || !readings || !Array.isArray(readings)) {
      return apiError("deviceId and readings array required");
    }

    const device = await prisma.tenantDevice.findFirst({
      where: { id: BigInt(deviceId), tenantId: auth.tenantId },
    });

    if (!device) {
      return apiError("Device not found", 404);
    }

    const now = getTelemetryTimestamp();
    
    const created = await prisma.telemetryKv.createMany({
      data: readings.map((r: { variable: string; value: number; timestamp?: string }) => ({
        tenantId: auth.tenantId,
        tenantDeviceId: device.id,
        variableCode: r.variable,
        value: r.value,
        capturedAt: r.timestamp ? parseAccraDate(r.timestamp) : now,
      })),
    });

    // Update device last seen (Africa/Accra timezone)
    await prisma.tenantDevice.update({
      where: { id: device.id },
      data: { lastSeenAt: now },
    });

    return apiSuccess({ created: created.count }, 201);
  } catch {
    return apiError("Invalid request body");
  }
}
