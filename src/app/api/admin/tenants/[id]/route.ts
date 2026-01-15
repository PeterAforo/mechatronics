import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { TenantStatus } from "@prisma/client";

const updateTenantSchema = z.object({
  companyName: z.string().min(1).optional(),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  status: z.nativeEnum(TenantStatus).optional(),
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
    const tenantId = BigInt(id);

    const [tenant, users, devices, subscriptions] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
      }),
      prisma.tenantUser.findMany({
        where: { tenantId },
      }),
      prisma.tenantDevice.findMany({
        where: { tenantId },
        include: {
          inventory: {
            include: {
              deviceType: true,
            },
          },
        },
      }),
      prisma.subscription.findMany({
        where: { tenantId },
      }),
    ]);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({
      tenant: {
        id: tenant.id.toString(),
        tenantCode: tenant.tenantCode,
        companyName: tenant.companyName,
        contactName: tenant.contactName,
        email: tenant.email,
        phone: tenant.phone,
        address: tenant.address,
        city: tenant.city,
        country: tenant.country,
        status: tenant.status,
        createdAt: tenant.createdAt.toISOString(),
        users: users.map(u => ({
          id: u.id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
        })),
        devices: devices.map(d => ({
          id: d.id.toString(),
          nickname: d.nickname,
          status: d.status,
          serialNumber: d.inventory?.serialNumber,
          deviceType: d.inventory?.deviceType?.name,
        })),
        subscriptionCount: subscriptions.length,
      },
    });
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return NextResponse.json({ error: "Failed to fetch tenant" }, { status: 500 });
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
    const tenantId = BigInt(id);
    const body = await request.json();
    const validated = updateTenantSchema.parse(body);

    const existingTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!existingTenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: validated,
    });

    return NextResponse.json({
      message: "Tenant updated successfully",
      tenant: {
        id: updatedTenant.id.toString(),
        companyName: updatedTenant.companyName,
        status: updatedTenant.status,
      },
    });
  } catch (error) {
    console.error("Error updating tenant:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update tenant" }, { status: 500 });
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
    const tenantId = BigInt(id);

    const [existingTenant, devices, activeSubscriptions] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
      }),
      prisma.tenantDevice.findMany({
        where: { tenantId },
      }),
      prisma.subscription.findMany({
        where: { tenantId, status: "active" },
      }),
    ]);

    if (!existingTenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Check for active subscriptions
    if (activeSubscriptions.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete tenant with active subscriptions. Please cancel subscriptions first." },
        { status: 400 }
      );
    }

    // Check for assigned devices
    if (devices.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete tenant with assigned devices. Please unassign devices first." },
        { status: 400 }
      );
    }

    // Delete tenant users first
    await prisma.tenantUser.deleteMany({
      where: { tenantId },
    });

    // Delete the tenant
    await prisma.tenant.delete({
      where: { id: tenantId },
    });

    return NextResponse.json({ message: "Tenant deleted successfully" });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return NextResponse.json({ error: "Failed to delete tenant" }, { status: 500 });
  }
}
