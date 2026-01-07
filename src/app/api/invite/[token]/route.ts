import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ token: string }>;
}

// GET /api/invite/[token] - Get invitation details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;

    const invitation = await prisma.tenantInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.acceptedAt) {
      return NextResponse.json({ error: "Invitation already accepted" }, { status: 400 });
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
    }

    // Get tenant and inviter info
    const [tenant, inviter] = await Promise.all([
      prisma.tenant.findUnique({ where: { id: invitation.tenantId } }),
      prisma.tenantUser.findUnique({ where: { id: invitation.invitedBy } }),
    ]);

    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
      companyName: tenant?.companyName || "Unknown Company",
      inviterName: inviter?.name || inviter?.email || "A team member",
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
