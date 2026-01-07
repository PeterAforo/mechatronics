import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/portal/team/[id] - Update team member role
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

    // Only owner can change roles
    if (session.user.role !== "owner") {
      return NextResponse.json({ error: "Only owner can change roles" }, { status: 403 });
    }

    const body = await request.json();
    const { role, status } = body;

    // Can't change own role
    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const user = await prisma.tenantUser.findFirst({
      where: { id: BigInt(id), tenantId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Can't demote owner
    if (user.role === "owner") {
      return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });
    }

    const updated = await prisma.tenantUser.update({
      where: { id: BigInt(id) },
      data: {
        role: role || user.role,
        status: status || user.status,
      },
    });

    return NextResponse.json({
      id: updated.id.toString(),
      email: updated.email,
      name: updated.name,
      role: updated.role,
      status: updated.status,
    });
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/portal/team/[id] - Remove team member
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

    // Only owner/admin can remove
    if (session.user.role !== "owner" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Can't remove self
    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
    }

    const user = await prisma.tenantUser.findFirst({
      where: { id: BigInt(id), tenantId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Can't remove owner
    if (user.role === "owner") {
      return NextResponse.json({ error: "Cannot remove owner" }, { status: 400 });
    }

    await prisma.tenantUser.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
