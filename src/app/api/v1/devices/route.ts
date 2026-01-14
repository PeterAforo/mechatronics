import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey, hasScope, apiError, apiSuccess } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return apiError("Invalid or missing API key", 401);
  }

  if (!hasScope(auth, "read") && !hasScope(auth, "devices:read")) {
    return apiError("Insufficient permissions", 403);
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Record<string, unknown> = { tenantId: auth.tenantId };
  if (status) {
    where.status = status;
  }

  const [devices, total] = await Promise.all([
    prisma.tenantDevice.findMany({
      where,
      include: {
        inventory: {
          include: { deviceType: true },
        },
        subscription: {
          include: { product: true },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenantDevice.count({ where }),
  ]);

  const serialized = devices.map(d => ({
    id: d.id.toString(),
    nickname: d.nickname,
    status: d.status,
    serialNumber: d.inventory?.serialNumber,
    deviceType: d.inventory?.deviceType?.name,
    product: d.subscription?.product?.name,
    installedAt: d.installedAt,
    lastSeenAt: d.lastSeenAt,
    createdAt: d.createdAt,
  }));

  return apiSuccess({
    devices: serialized,
    pagination: { total, limit, offset },
  });
}
