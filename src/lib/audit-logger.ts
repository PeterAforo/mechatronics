import prisma from "@/lib/prisma";
import { UserType } from "@prisma/client";

interface AuditLogParams {
  tenantId?: bigint | null;
  userId?: bigint | null;
  userType: UserType;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAudit(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: params.tenantId || null,
        userId: params.userId || null,
        userType: params.userType,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
        newValues: params.newValues ? JSON.stringify(params.newValues) : null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
}

export function getClientInfo(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}
