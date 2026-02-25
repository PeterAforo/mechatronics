import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/portal/devices - Get tenant devices with pagination
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 20, max: 100)
 *   - status: string (optional filter)
 *   - sort: string (default: "lastSeenAt")
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
    const sort = searchParams.get("sort") || "lastSeenAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { tenantId };
    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.tenantDevice.count({ where });

    // Get devices with pagination
    const devices = await prisma.tenantDevice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        inventory: {
          include: {
            deviceType: true,
          },
        },
        subscription: {
          include: {
            product: true,
          },
        },
      },
    });

    // Format response
    const formattedDevices = devices.map((device) => ({
      id: device.id.toString(),
      nickname: device.nickname,
      status: device.status,
      lastSeenAt: device.lastSeenAt?.toISOString() || null,
      createdAt: device.createdAt.toISOString(),
      inventory: device.inventory ? {
        id: device.inventory.id.toString(),
        serialNumber: device.inventory.serialNumber,
        firmwareVersion: device.inventory.firmwareVersion,
        deviceType: device.inventory.deviceType ? {
          id: device.inventory.deviceType.id.toString(),
          name: device.inventory.deviceType.name,
          typeCode: device.inventory.deviceType.typeCode,
        } : null,
      } : null,
      subscription: device.subscription ? {
        id: device.subscription.id.toString(),
        status: device.subscription.status,
        product: device.subscription.product ? {
          id: device.subscription.product.id.toString(),
          name: device.subscription.product.name,
          category: device.subscription.product.category,
        } : null,
      } : null,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: formattedDevices,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching devices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
