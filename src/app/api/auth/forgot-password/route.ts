import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  userType: z.enum(["tenant", "admin"]).default("tenant"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, userType } = forgotPasswordSchema.parse(body);

    // Find user based on type
    let user: { id: bigint; email: string; name: string | null } | null = null;

    if (userType === "admin") {
      user = await prisma.adminUser.findUnique({
        where: { email },
        select: { id: true, email: true, name: true },
      });
    } else {
      user = await prisma.tenantUser.findUnique({
        where: { email },
        select: { id: true, email: true, name: true },
      });
    }

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email, userType },
    });

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        userType,
        expiresAt,
      },
    });

    // Send email
    const baseUrl = process.env.NEXTAUTH_URL || "https://mechatronics.com.gh";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    const template = emailTemplates.passwordReset(resetUrl, user.name || undefined);

    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
