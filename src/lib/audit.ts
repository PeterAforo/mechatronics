// Audit logging service for compliance and tracking
import prisma from "./prisma";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "view"
  | "export"
  | "invite"
  | "payment"
  | "alert_acknowledge"
  | "device_provision"
  | "firmware_update";

export type EntityType =
  | "user"
  | "tenant"
  | "device"
  | "site"
  | "zone"
  | "order"
  | "subscription"
  | "alert"
  | "alert_rule"
  | "product"
  | "inventory"
  | "api_key"
  | "report"
  | "firmware";

export interface AuditLogParams {
  tenantId?: bigint | string | null;
  userId?: bigint | string | null;
  userType: "admin" | "tenant";
  action: AuditAction;
  entityType: EntityType;
  entityId?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: params.tenantId ? BigInt(params.tenantId.toString()) : null,
        userId: params.userId ? BigInt(params.userId.toString()) : null,
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
    // Log but don't throw - audit logging should not break the main flow
    console.error("Failed to create audit log:", error);
  }
}

// Helper to extract IP from request
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return null;
}

// Helper to get user agent
export function getUserAgent(request: Request): string | null {
  return request.headers.get("user-agent");
}

// Convenience function for logging from API routes
export async function logAction(
  request: Request,
  params: Omit<AuditLogParams, "ipAddress" | "userAgent">
): Promise<void> {
  await createAuditLog({
    ...params,
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });
}

// Get audit logs for a tenant
export async function getAuditLogs(
  tenantId: bigint,
  options: {
    limit?: number;
    offset?: number;
    action?: AuditAction;
    entityType?: EntityType;
    startDate?: Date;
    endDate?: Date;
  } = {}
) {
  const where: Record<string, unknown> = { tenantId };

  if (options.action) {
    where.action = options.action;
  }
  if (options.entityType) {
    where.entityType = options.entityType;
  }
  if (options.startDate || options.endDate) {
    where.createdAt = {};
    if (options.startDate) {
      (where.createdAt as Record<string, Date>).gte = options.startDate;
    }
    if (options.endDate) {
      (where.createdAt as Record<string, Date>).lte = options.endDate;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options.limit || 50,
      skip: options.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}
