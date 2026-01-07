import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deviceTypes = await prisma.deviceType.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(deviceTypes.map(dt => ({
    ...dt,
    id: dt.id.toString(),
  })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { modelCode, name, description, category, manufacturer, protocol } = body;

    if (!modelCode || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const deviceType = await prisma.deviceType.create({
      data: {
        typeCode: modelCode,
        name,
        description: description || null,
        category: category || "other",
        manufacturer: manufacturer || null,
        communicationProtocol: protocol || "http",
        isActive: true,
      },
    });

    return NextResponse.json({
      ...deviceType,
      id: deviceType.id.toString(),
    });
  } catch (error: unknown) {
    console.error("Error creating device type:", error);
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      return NextResponse.json({ message: "Model code already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create device type" }, { status: 500 });
  }
}
