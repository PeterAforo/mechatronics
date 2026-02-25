import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createMobileTokens, type MobileUser } from "@/lib/mobile-auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  userType: z.enum(["tenant", "admin"]).default("tenant"),
  deviceId: z.string().optional(),
  platform: z.enum(["ios", "android"]).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, userType, deviceId } = validation.data;

    let user: MobileUser | null = null;
    let userId: bigint | null = null;

    if (userType === "tenant") {
      const tenantUser = await prisma.tenantUser.findUnique({
        where: { email },
        include: { tenant: true },
      });

      if (!tenantUser) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      if (tenantUser.status !== "active") {
        return NextResponse.json(
          { error: "Account is not active. Please verify your email or contact support." },
          { status: 403 }
        );
      }

      const isPasswordValid = await compare(password, tenantUser.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Update last login
      await prisma.tenantUser.update({
        where: { id: tenantUser.id },
        data: { lastLoginAt: new Date() },
      });

      userId = tenantUser.id;
      user = {
        id: tenantUser.id.toString(),
        email: tenantUser.email,
        name: tenantUser.name,
        role: tenantUser.role,
        userType: "tenant",
        tenantId: tenantUser.tenantId.toString(),
        tenantName: tenantUser.tenant.companyName,
      };
    } else {
      const adminUser = await prisma.adminUser.findUnique({
        where: { email },
      });

      if (!adminUser) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      if (adminUser.status !== "active") {
        return NextResponse.json(
          { error: "Account is not active" },
          { status: 403 }
        );
      }

      const isPasswordValid = await compare(password, adminUser.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Update last login
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { lastLoginAt: new Date() },
      });

      userId = adminUser.id;
      user = {
        id: adminUser.id.toString(),
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        userType: "admin",
      };
    }

    // Generate tokens
    const tokens = await createMobileTokens(userId!, userType, deviceId);

    return NextResponse.json({
      success: true,
      user,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        expiresAt: tokens.expiresAt,
      },
    });
  } catch (error) {
    console.error("Mobile login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
