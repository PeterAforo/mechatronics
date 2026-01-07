import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ deviceId: string }>;
}

// GET /api/devices/[deviceId]/readings - Get readings for a device
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const { deviceId } = await params;
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this device
    const userDevice = await prisma.userDevice.findFirst({
      where: {
        userId: session.user.id,
        deviceId: deviceId,
      },
    });

    if (!userDevice && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Get URL params for filtering
    const url = new URL(request.url);
    const variable = url.searchParams.get("variable");
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const whereClause: {
      deviceId: string;
      variable?: { code: string };
      timestamp?: { gte?: Date; lte?: Date };
    } = { deviceId };

    if (variable) {
      whereClause.variable = { code: variable };
    }

    if (from || to) {
      whereClause.timestamp = {};
      if (from) whereClause.timestamp.gte = new Date(from);
      if (to) whereClause.timestamp.lte = new Date(to);
    }

    const readings = await prisma.reading.findMany({
      where: whereClause,
      include: {
        variable: {
          select: {
            code: true,
            name: true,
            unit: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return NextResponse.json({ readings });
  } catch (error) {
    console.error("Error fetching readings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
