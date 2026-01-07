import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/alerts - Get all alerts across tenants
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    // Get tenant names
    const tenantIds = [...new Set(alerts.map((a) => a.tenantId))];
    const tenants = await prisma.tenant.findMany({
      where: { id: { in: tenantIds } },
      select: { id: true, companyName: true },
    });
    const tenantMap = new Map(tenants.map((t) => [t.id.toString(), t.companyName]));

    // Get device names
    const deviceIds = [...new Set(alerts.map((a) => a.tenantDeviceId))];
    const devices = await prisma.tenantDevice.findMany({
      where: { id: { in: deviceIds } },
      select: { id: true, nickname: true },
    });
    const deviceMap = new Map(devices.map((d) => [d.id.toString(), d.nickname || `Device ${d.id}`]));

    return NextResponse.json(
      alerts.map((a) => ({
        id: a.id.toString(),
        tenantId: a.tenantId.toString(),
        tenantName: tenantMap.get(a.tenantId.toString()) || "Unknown",
        deviceId: a.tenantDeviceId.toString(),
        deviceName: deviceMap.get(a.tenantDeviceId.toString()) || "Unknown",
        title: a.title,
        message: a.message,
        severity: a.severity,
        status: a.status,
        value: Number(a.value),
        createdAt: a.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
