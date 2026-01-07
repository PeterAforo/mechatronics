import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "tenant") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 400 });
  }

  const { id, zoneId } = await params;

  // Verify site ownership
  const site = await prisma.tenantSite.findFirst({
    where: { id: BigInt(id), tenantId },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Verify zone belongs to site
  const zone = await prisma.siteZone.findFirst({
    where: { id: BigInt(zoneId), siteId: BigInt(id) },
  });

  if (!zone) {
    return NextResponse.json({ error: "Zone not found" }, { status: 404 });
  }

  await prisma.siteZone.delete({
    where: { id: BigInt(zoneId) },
  });

  return NextResponse.json({ success: true });
}
