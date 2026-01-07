import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.deviceProduct.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products.map(p => ({
    ...p,
    id: p.id.toString(),
    deviceTypeId: p.deviceTypeId?.toString(),
    setupFee: Number(p.setupFee),
    monthlyFee: Number(p.monthlyFee),
  })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { productCode, name, shortDescription, description, category, setupFee, monthlyFee, currency, isPublished } = body;

    if (!productCode || !name || !setupFee || !monthlyFee) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const product = await prisma.deviceProduct.create({
      data: {
        productCode,
        name,
        shortDescription: shortDescription || null,
        description: description || null,
        category: category || "other",
        setupFee: parseFloat(setupFee),
        monthlyFee: parseFloat(monthlyFee),
        currency: currency || "GHS",
        isPublished: isPublished || false,
      },
    });

    return NextResponse.json({ 
      ...product, 
      id: product.id.toString(),
      setupFee: Number(product.setupFee),
      monthlyFee: Number(product.monthlyFee),
    });
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      return NextResponse.json({ message: "Product code already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 });
  }
}
