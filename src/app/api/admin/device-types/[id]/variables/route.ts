import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const variables = await prisma.deviceTypeVariable.findMany({
      where: { deviceTypeId: BigInt(id) },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json(variables.map(v => ({
      ...v,
      id: v.id.toString(),
      deviceTypeId: v.deviceTypeId.toString(),
      minValue: v.minValue?.toString() || "",
      maxValue: v.maxValue?.toString() || "",
    })));
  } catch {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deviceTypeId = BigInt(id);

  try {
    const body = await req.json();
    const { variables } = body;

    // Get existing variable IDs
    const existingVars = await prisma.deviceTypeVariable.findMany({
      where: { deviceTypeId },
      select: { id: true },
    });
    const existingIds = new Set(existingVars.map(v => v.id.toString()));

    // Process each variable
    const incomingIds = new Set<string>();
    
    for (let i = 0; i < variables.length; i++) {
      const v = variables[i];
      const data = {
        variableCode: v.variableCode,
        label: v.label,
        unit: v.unit || null,
        description: v.description || null,
        minValue: v.minValue ? parseFloat(v.minValue) : null,
        maxValue: v.maxValue ? parseFloat(v.maxValue) : null,
        displayWidget: v.displayWidget || "numeric",
        displayOrder: i,
        isAlertable: v.isAlertable ?? true,
        isRequired: v.isRequired ?? false,
      };

      if (v.id && !v.isNew) {
        // Update existing
        incomingIds.add(v.id);
        await prisma.deviceTypeVariable.update({
          where: { id: BigInt(v.id) },
          data,
        });
      } else {
        // Create new
        await prisma.deviceTypeVariable.create({
          data: {
            ...data,
            deviceTypeId,
          },
        });
      }
    }

    // Delete removed variables
    for (const existingId of existingIds) {
      if (!incomingIds.has(existingId)) {
        await prisma.deviceTypeVariable.delete({
          where: { id: BigInt(existingId) },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving variables:", error);
    return NextResponse.json({ message: "Failed to save variables" }, { status: 500 });
  }
}
