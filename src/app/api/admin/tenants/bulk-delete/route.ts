import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID is required"),
});

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = bulkDeleteSchema.parse(body);

    const tenantIds = ids.map((id) => BigInt(id));

    // Check for tenants with active subscriptions or devices
    const tenantsWithDependencies = await Promise.all(
      tenantIds.map(async (tenantId) => {
        const [devices, subscriptions] = await Promise.all([
          prisma.tenantDevice.count({ where: { tenantId } }),
          prisma.subscription.count({ where: { tenantId, status: "active" } }),
        ]);
        return { tenantId, hasDevices: devices > 0, hasSubscriptions: subscriptions > 0 };
      })
    );

    const blocked = tenantsWithDependencies.filter((t) => t.hasDevices || t.hasSubscriptions);
    if (blocked.length > 0) {
      return NextResponse.json(
        {
          error: `${blocked.length} tenant(s) have active subscriptions or devices and cannot be deleted. Please remove dependencies first.`,
        },
        { status: 400 }
      );
    }

    // Delete tenant users first
    await prisma.tenantUser.deleteMany({
      where: { tenantId: { in: tenantIds } },
    });

    // Delete tenants
    const result = await prisma.tenant.deleteMany({
      where: { id: { in: tenantIds } },
    });

    return NextResponse.json({
      message: `${result.count} tenant(s) deleted successfully`,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Error bulk deleting tenants:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete tenants" }, { status: 500 });
  }
}
