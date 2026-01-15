import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateRuleSchema = z.object({
  ruleName: z.string().min(1).optional(),
  deviceTypeId: z.string().optional(),
  variableCode: z.string().optional(),
  operator: z.enum(["lt", "lte", "eq", "neq", "gte", "gt", "between", "outside"]).optional(),
  threshold1: z.number().optional(),
  threshold2: z.number().nullable().optional(),
  severity: z.enum(["info", "warning", "critical"]).optional(),
  messageTemplate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ruleId = BigInt(id);

    const rule = await prisma.alertRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      return NextResponse.json({ error: "Alert rule not found" }, { status: 404 });
    }

    return NextResponse.json({
      rule: {
        id: rule.id.toString(),
        ruleName: rule.ruleName,
        deviceTypeId: rule.deviceTypeId.toString(),
        variableCode: rule.variableCode,
        operator: rule.operator,
        threshold1: Number(rule.threshold1),
        threshold2: rule.threshold2 ? Number(rule.threshold2) : null,
        severity: rule.severity,
        messageTemplate: rule.messageTemplate,
        isActive: rule.isActive,
        createdAt: rule.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching alert rule:", error);
    return NextResponse.json({ error: "Failed to fetch alert rule" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ruleId = BigInt(id);
    const body = await request.json();
    const validated = updateRuleSchema.parse(body);

    const existingRule = await prisma.alertRule.findUnique({
      where: { id: ruleId },
    });

    if (!existingRule) {
      return NextResponse.json({ error: "Alert rule not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (validated.ruleName !== undefined) updateData.ruleName = validated.ruleName;
    if (validated.deviceTypeId !== undefined) updateData.deviceTypeId = BigInt(validated.deviceTypeId);
    if (validated.variableCode !== undefined) updateData.variableCode = validated.variableCode;
    if (validated.operator !== undefined) updateData.operator = validated.operator;
    if (validated.threshold1 !== undefined) updateData.threshold1 = validated.threshold1;
    if (validated.threshold2 !== undefined) updateData.threshold2 = validated.threshold2;
    if (validated.severity !== undefined) updateData.severity = validated.severity;
    if (validated.messageTemplate !== undefined) updateData.messageTemplate = validated.messageTemplate;
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive;

    const updatedRule = await prisma.alertRule.update({
      where: { id: ruleId },
      data: updateData,
    });

    return NextResponse.json({
      message: "Alert rule updated successfully",
      rule: {
        id: updatedRule.id.toString(),
        ruleName: updatedRule.ruleName,
      },
    });
  } catch (error) {
    console.error("Error updating alert rule:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update alert rule" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ruleId = BigInt(id);

    const existingRule = await prisma.alertRule.findUnique({
      where: { id: ruleId },
    });

    if (!existingRule) {
      return NextResponse.json({ error: "Alert rule not found" }, { status: 404 });
    }

    await prisma.alertRule.delete({
      where: { id: ruleId },
    });

    return NextResponse.json({ message: "Alert rule deleted successfully" });
  } catch (error) {
    console.error("Error deleting alert rule:", error);
    return NextResponse.json({ error: "Failed to delete alert rule" }, { status: 500 });
  }
}
