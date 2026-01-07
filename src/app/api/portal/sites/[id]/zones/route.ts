import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "tenant") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 400 });
  }

  const { id } = await params;
  const body = await req.json();
  const { zoneName, description } = body;

  if (!zoneName) {
    return NextResponse.json({ error: "Zone name is required" }, { status: 400 });
  }

  // Verify site ownership
  const site = await prisma.tenantSite.findFirst({
    where: { id: BigInt(id), tenantId },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const zone = await prisma.siteZone.create({
    data: {
      siteId: BigInt(id),
      zoneName,
      description: description || null,
      status: "active",
    },
  });

  return NextResponse.json({
    ...zone,
    id: zone.id.toString(),
    siteId: zone.siteId.toString(),
  });
}
