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

    const inventoryIds = ids.map((id) => BigInt(id));

    // Check for deployed devices
    const deployedCount = await prisma.tenantDevice.count({
      where: { inventoryId: { in: inventoryIds } },
    });

    if (deployedCount > 0) {
      return NextResponse.json(
        { error: `${deployedCount} device(s) are deployed to tenants and cannot be deleted.` },
        { status: 400 }
      );
    }

    const result = await prisma.deviceInventory.deleteMany({
      where: { id: { in: inventoryIds } },
    });

    return NextResponse.json({
      message: `${result.count} inventory item(s) deleted successfully`,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Error bulk deleting inventory:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete inventory" }, { status: 500 });
  }
}
