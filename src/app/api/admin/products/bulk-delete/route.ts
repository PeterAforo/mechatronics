import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID is required"),
});

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = bulkDeleteSchema.parse(body);

    const productIds = ids.map((id) => BigInt(id));

    // Check for active subscriptions
    const subscriptionCount = await prisma.subscription.count({
      where: { productId: { in: productIds }, status: "active" },
    });

    if (subscriptionCount > 0) {
      return NextResponse.json(
        { error: `${subscriptionCount} product(s) have active subscriptions and cannot be deleted.` },
        { status: 400 }
      );
    }

    const result = await prisma.deviceProduct.deleteMany({
      where: { id: { in: productIds } },
    });

    return NextResponse.json({
      message: `${result.count} product(s) deleted successfully`,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete products" }, { status: 500 });
  }
}
