import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/audit-logs - Get all audit logs
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    // Get tenant names
    const tenantIds = [...new Set(logs.filter((l) => l.tenantId).map((l) => l.tenantId as bigint))];
    const tenants = tenantIds.length > 0
      ? await prisma.tenant.findMany({
          where: { id: { in: tenantIds } },
          select: { id: true, companyName: true },
        })
      : [];
    const tenantMap = new Map(tenants.map((t) => [t.id.toString(), t.companyName]));

    // Get user emails
    const userIds = [...new Set(logs.filter((l) => l.userId).map((l) => l.userId as bigint))];
    const users = userIds.length > 0
      ? await prisma.tenantUser.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id.toString(), u.email]));

    return NextResponse.json(
      logs.map((l) => ({
        id: l.id.toString(),
        tenantId: l.tenantId?.toString() || null,
        tenantName: l.tenantId ? tenantMap.get(l.tenantId.toString()) || null : null,
        userId: l.userId?.toString() || null,
        userEmail: l.userId ? userMap.get(l.userId.toString()) || null : null,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId?.toString() || null,
        details: l.details,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        createdAt: l.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
