import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail, emailTemplates } from "@/lib/email";

// GET /api/portal/team - Get all team members
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    const [users, invitations] = await Promise.all([
      prisma.tenantUser.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tenantInvitation.findMany({
        where: { tenantId, acceptedAt: null },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id.toString(),
        email: u.email,
        name: u.name,
        phone: u.phone,
        role: u.role,
        status: u.status,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      })),
      invitations: invitations.map((i) => ({
        id: i.id.toString(),
        email: i.email,
        role: i.role,
        expiresAt: i.expiresAt,
        createdAt: i.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/portal/team - Invite a new team member
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    // Only owner/admin can invite
    if (session.user.role !== "owner" && session.user.role !== "admin") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.tenantUser.findFirst({
      where: { email, tenantId },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists in team" }, { status: 400 });
    }

    // Check for pending invitation
    const existingInvite = await prisma.tenantInvitation.findFirst({
      where: { email, tenantId, acceptedAt: null },
    });

    if (existingInvite) {
      return NextResponse.json({ error: "Invitation already pending" }, { status: 400 });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.tenantInvitation.create({
      data: {
        tenantId,
        email,
        role: role || "user",
        token,
        invitedBy: BigInt(session.user.id),
        expiresAt,
      },
    });

    // Send invitation email
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://mechatronics.com.gh";
    const inviteUrl = `${baseUrl}/invite/${token}`;
    
    // Get tenant info for the email
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { companyName: true },
    });

    const template = emailTemplates.teamInvitation(
      tenant?.companyName || "Your Team",
      session.user.name || "A team member",
      inviteUrl
    );

    sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    }).catch((err) => console.error("Failed to send invitation email:", err));

    return NextResponse.json({
      id: invitation.id.toString(),
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      inviteUrl, // Only for development
    });
  } catch (error) {
    console.error("Error inviting team member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
