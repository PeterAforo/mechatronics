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

    const orderIds = ids.map((id) => BigInt(id));

    // Delete order items first
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: orderIds } },
    });

    const result = await prisma.order.deleteMany({
      where: { id: { in: orderIds } },
    });

    return NextResponse.json({
      message: `${result.count} order(s) deleted successfully`,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Error bulk deleting orders:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete orders" }, { status: 500 });
  }
}
