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

    const deviceTypeIds = ids.map((id) => BigInt(id));

    // Check for inventory using these device types
    const inventoryCount = await prisma.deviceInventory.count({
      where: { deviceTypeId: { in: deviceTypeIds } },
    });

    if (inventoryCount > 0) {
      return NextResponse.json(
        { error: `${inventoryCount} device(s) in inventory use these device types. Remove inventory first.` },
        { status: 400 }
      );
    }

    // Delete variables first
    await prisma.deviceTypeVariable.deleteMany({
      where: { deviceTypeId: { in: deviceTypeIds } },
    });

    const result = await prisma.deviceType.deleteMany({
      where: { id: { in: deviceTypeIds } },
    });

    return NextResponse.json({
      message: `${result.count} device type(s) deleted successfully`,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Error bulk deleting device types:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to delete device types" }, { status: 500 });
  }
}
