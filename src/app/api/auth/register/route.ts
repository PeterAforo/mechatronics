import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { sendEmail, emailTemplates } from "@/lib/email";
import { generateOrderRef } from "@/lib/utils/generators";
import { checkRateLimit, getClientIP, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";

const registerSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  productCode: z.string().optional(),
  quantity: z.number().min(1).max(10).optional(),
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
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`register:${clientIP}`, RATE_LIMITS.auth);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { companyName, contactName, email, phone, password, productCode, quantity = 1 } = validation.data;

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

    // If productCode provided, get the product first
    let product = null;
    if (productCode) {
      product = await prisma.deviceProduct.findUnique({
        where: { productCode },
      });
    }

    // Create tenant, user, and order (if product) in a transaction
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

      // Create order if product was selected during registration
      let order = null;
      if (product) {
        const setupFee = Number(product.setupFee);
        const monthlyFee = Number(product.monthlyFee);
        const lineTotal = (setupFee + monthlyFee) * quantity;

        order = await tx.order.create({
          data: {
            tenantId: tenant.id,
            orderRef: generateOrderRef(),
            status: "pending",
            currency: product.currency,
            subtotal: lineTotal,
            discount: 0,
            tax: 0,
            total: lineTotal,
            items: {
              create: {
                productId: product.id,
                quantity,
                setupFee: product.setupFee,
                monthlyFee: product.monthlyFee,
                billingInterval: product.billingInterval,
                lineTotal,
              },
            },
          },
        });
      }

      return { tenant, user, order };
    });

    // Send welcome email (async, don't block response)
    const baseUrl = process.env.NEXTAUTH_URL || "https://mechatronics.com.gh";
    const loginUrl = `${baseUrl}/login`;
    const template = emailTemplates.welcomeEmail(contactName, loginUrl);
    sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    }).catch(console.error);

    return NextResponse.json(
      {
        message: result.order 
          ? "Account created and order placed successfully! Please sign in to view your order."
          : "Account created successfully",
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
        order: result.order ? {
          id: result.order.id.toString(),
          orderRef: result.order.orderRef,
          status: result.order.status,
          total: result.order.total.toString(),
        } : null,
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
