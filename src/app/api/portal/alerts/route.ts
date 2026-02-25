import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/portal/alerts - Get tenant alerts with pagination
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20, max: 100)
 *   - status: string (optional filter: open, acknowledged, resolved)
 *   - severity: string (optional filter: critical, warning, info)
 *   - sort: string (default: "createdAt")
 *   - order: "asc" | "desc" (default: "desc")
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { tenantId };
    if (status) {
      where.status = status;
    }
    if (severity) {
      where.severity = severity;
    }

    // Get total count
    const total = await prisma.alert.count({ where });

    // Get alerts with pagination
    const alerts = await prisma.alert.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
    });

    // Format response
    const formattedAlerts = alerts.map((alert) => ({
      id: alert.id.toString(),
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      status: alert.status,
      variableCode: alert.variableCode,
      value: Number(alert.value),
      tenantDeviceId: alert.tenantDeviceId.toString(),
      alertRuleId: alert.alertRuleId?.toString() || null,
      resolvedAt: alert.resolvedAt?.toISOString() || null,
      createdAt: alert.createdAt.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: formattedAlerts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
