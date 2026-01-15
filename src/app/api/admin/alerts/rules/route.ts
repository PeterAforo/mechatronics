import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createRuleSchema = z.object({
  ruleName: z.string().min(2, "Rule name is required"),
  deviceTypeId: z.string().min(1, "Device type is required"),
  variableCode: z.string().min(1, "Variable is required"),
  operator: z.enum(["lt", "lte", "eq", "neq", "gte", "gt", "between", "outside"]),
  threshold1: z.number(),
  threshold2: z.number().nullable().optional(),
  severity: z.enum(["info", "warning", "critical"]),
  messageTemplate: z.string().optional(),
  isActive: z.boolean().default(true),
  tenantId: z.string().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rules = await prisma.alertRule.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    rules: rules.map((rule) => ({
      id: rule.id.toString(),
      tenantId: rule.tenantId?.toString() || null,
      deviceTypeId: rule.deviceTypeId.toString(),
      variableCode: rule.variableCode,
      ruleName: rule.ruleName,
      operator: rule.operator,
      threshold1: Number(rule.threshold1),
      threshold2: rule.threshold2 ? Number(rule.threshold2) : null,
      severity: rule.severity,
      messageTemplate: rule.messageTemplate,
      isActive: rule.isActive,
      createdAt: rule.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createRuleSchema.parse(body);

    // Verify device type exists
    const deviceType = await prisma.deviceType.findUnique({
      where: { id: BigInt(data.deviceTypeId) },
    });

    if (!deviceType) {
      return NextResponse.json({ error: "Device type not found" }, { status: 404 });
    }

    // Create the alert rule
    const rule = await prisma.alertRule.create({
      data: {
        tenantId: data.tenantId ? BigInt(data.tenantId) : null,
        deviceTypeId: BigInt(data.deviceTypeId),
        variableCode: data.variableCode,
        ruleName: data.ruleName,
        operator: data.operator,
        threshold1: data.threshold1,
        threshold2: data.threshold2 || null,
        severity: data.severity,
        messageTemplate: data.messageTemplate || `Alert: ${data.variableCode} triggered ${data.ruleName}`,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Alert rule created successfully",
      rule: {
        id: rule.id.toString(),
        ruleName: rule.ruleName,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Create alert rule error:", error);
    return NextResponse.json(
      { error: "Failed to create alert rule" },
      { status: 500 }
    );
  }
}
