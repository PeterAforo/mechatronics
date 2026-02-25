import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

// POST - Send verification email
export async function POST(request: NextRequest) {
  try {
    const { email, userType = "tenant" } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user - only tenant users have email verification
    const user = await prisma.tenantUser.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, emailVerifiedAt: true },
    });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({ message: "If an account exists, a verification email will be sent." });
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ message: "Email is already verified." });
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email, userType: "tenant" },
    });

    // Create new token
    await prisma.passwordResetToken.create({
      data: { email, token, userType: "tenant", expiresAt },
    });

    // Send verification email
    const baseUrl = process.env.NEXTAUTH_URL || "https://mechatronics.com.gh";
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Verify Your Email - Mechatronics",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Verify Your Email</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px;">Hi${user.name ? ` ${user.name}` : ""}! 👋</h2>
              <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
                Please verify your email address to complete your registration and access all features of Mechatronics.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2026 Mechatronics. All rights reserved.<br>
                Accra, Ghana
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Verify Your Email\n\nHi${user.name ? ` ${user.name}` : ""}!\n\nPlease verify your email address by visiting:\n${verifyUrl}\n\nThis link will expire in 24 hours.\n\n© 2026 Mechatronics`,
    });

    return NextResponse.json({ message: "Verification email sent." });
  } catch (error) {
    console.error("Send verification email error:", error);
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}

// GET - Verify email with token
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    // Update user's emailVerifiedAt (only tenant users have this field)
    await prisma.tenantUser.update({
      where: { email: resetToken.email },
      data: { emailVerifiedAt: new Date() },
    });

    // Delete the token
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    return NextResponse.json({ 
      success: true, 
      message: "Email verified successfully!",
      email: resetToken.email,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 });
  }
}
