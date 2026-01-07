import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/portal/alert-rules/[id] - Get a specific alert rule
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    const rule = await prisma.alertRule.findFirst({
      where: {
        id: BigInt(id),
        OR: [{ tenantId }, { tenantId: null }],
      },
    });

    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...rule,
      id: rule.id.toString(),
      tenantId: rule.tenantId?.toString() || null,
      deviceTypeId: rule.deviceTypeId.toString(),
      threshold1: Number(rule.threshold1),
      threshold2: rule.threshold2 ? Number(rule.threshold2) : null,
    });
  } catch (error) {
    console.error("Error fetching alert rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/portal/alert-rules/[id] - Update an alert rule
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    // Check ownership
    const existing = await prisma.alertRule.findFirst({
      where: { id: BigInt(id), tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Rule not found or not owned" }, { status: 404 });
    }

    const body = await request.json();
    const {
      ruleName,
      operator,
      threshold1,
      threshold2,
      severity,
      messageTemplate,
      isActive,
    } = body;

    const rule = await prisma.alertRule.update({
      where: { id: BigInt(id) },
      data: {
        ruleName: ruleName || existing.ruleName,
        operator: operator || existing.operator,
        threshold1: threshold1 !== undefined ? threshold1 : existing.threshold1,
        threshold2: threshold2 !== undefined ? threshold2 : existing.threshold2,
        severity: severity || existing.severity,
        messageTemplate: messageTemplate || existing.messageTemplate,
        isActive: isActive !== undefined ? isActive : existing.isActive,
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
    console.error("Error updating alert rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/portal/alert-rules/[id] - Delete an alert rule
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    // Check ownership
    const existing = await prisma.alertRule.findFirst({
      where: { id: BigInt(id), tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Rule not found or not owned" }, { status: 404 });
    }

    await prisma.alertRule.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting alert rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
