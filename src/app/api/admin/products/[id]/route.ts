import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.deviceProduct.findUnique({
    where: { id: BigInt(id) },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...product,
    id: product.id.toString(),
    deviceTypeId: product.deviceTypeId?.toString(),
    setupFee: Number(product.setupFee),
    monthlyFee: Number(product.monthlyFee),
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { productCode, name, shortDescription, description, category, setupFee, monthlyFee, currency, isPublished } = body;

    const product = await prisma.deviceProduct.update({
      where: { id: BigInt(id) },
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
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.deviceProduct.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}
