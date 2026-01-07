import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const product = await prisma.deviceProduct.findUnique({
      where: { productCode: code },
      include: { deviceType: true },
    });

    if (!product || !product.isPublished) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      id: product.id.toString(),
      deviceTypeId: product.deviceTypeId?.toString() || null,
      setupFee: product.setupFee.toString(),
      monthlyFee: product.monthlyFee.toString(),
      deviceType: product.deviceType ? {
        ...product.deviceType,
        id: product.deviceType.id.toString(),
      } : null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
