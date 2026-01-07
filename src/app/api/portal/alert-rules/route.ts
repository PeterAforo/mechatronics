import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/portal/alert-rules - Get all alert rules for tenant
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    const rules = await prisma.alertRule.findMany({
      where: {
        OR: [
          { tenantId },
          { tenantId: null }, // Global rules
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      rules.map((rule) => ({
        ...rule,
        id: rule.id.toString(),
        tenantId: rule.tenantId?.toString() || null,
        deviceTypeId: rule.deviceTypeId.toString(),
        threshold1: Number(rule.threshold1),
        threshold2: rule.threshold2 ? Number(rule.threshold2) : null,
      }))
    );
  } catch (error) {
    console.error("Error fetching alert rules:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/portal/alert-rules - Create a new alert rule
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    // Check if user has admin/owner role
    if (session.user.role !== "owner" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const {
      deviceTypeId,
      variableCode,
      ruleName,
      operator,
      threshold1,
      threshold2,
      severity,
      messageTemplate,
    } = body;

    if (!deviceTypeId || !variableCode || !ruleName || !threshold1) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const rule = await prisma.alertRule.create({
      data: {
        tenantId,
        deviceTypeId: BigInt(deviceTypeId),
        variableCode,
        ruleName,
        operator: operator || "lte",
        threshold1: threshold1,
        threshold2: threshold2 || null,
        severity: severity || "warning",
        messageTemplate: messageTemplate || `${variableCode} value is {value}`,
        isActive: true,
      },
    });

    return NextResponse.json({
      ...rule,
      id: rule.id.toString(),
      tenantId: rule.tenantId?.toString() || null,
      deviceTypeId: rule.deviceTypeId.toString(),
      threshold1: Number(rule.threshold1),
      threshold2: rule.threshold2 ? Number(rule.threshold2) : null,
    });
  } catch (error) {
    console.error("Error creating alert rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
