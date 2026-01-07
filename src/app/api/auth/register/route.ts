import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function generateTenantCode(companyName: string): string {
  const base = companyName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}-${suffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { companyName, contactName, email, phone, password } = validation.data;

    // Check if email already exists
    const existingUser = await prisma.tenantUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check if tenant email exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { email },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: "A company with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate unique tenant code
    const tenantCode = generateTenantCode(companyName);

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          tenantCode,
          companyName,
          contactName,
          email,
          phone: phone || null,
          status: "active",
        },
      });

      // Create tenant user (owner)
      const user = await tx.tenantUser.create({
        data: {
          tenantId: tenant.id,
          email,
          passwordHash: hashedPassword,
          name: contactName,
          phone: phone || null,
          role: "owner",
          status: "active",
          emailVerifiedAt: new Date(),
        },
      });

      return { tenant, user };
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        tenant: {
          id: result.tenant.id.toString(),
          code: result.tenant.tenantCode,
          companyName: result.tenant.companyName,
        },
        user: {
          id: result.user.id.toString(),
          email: result.user.email,
          name: result.user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
