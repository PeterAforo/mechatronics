import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
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

  const site = await prisma.tenantSite.findFirst({
    where: { id: BigInt(id), tenantId },
    include: { zones: true },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...site,
    id: site.id.toString(),
    tenantId: site.tenantId.toString(),
    latitude: site.latitude ? Number(site.latitude) : null,
    longitude: site.longitude ? Number(site.longitude) : null,
    zones: site.zones.map((z) => ({
      ...z,
      id: z.id.toString(),
      siteId: z.siteId.toString(),
    })),
  });
}

export async function PATCH(
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
  const { siteName, address } = body;

  // Verify ownership
  const existing = await prisma.tenantSite.findFirst({
    where: { id: BigInt(id), tenantId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const site = await prisma.tenantSite.update({
    where: { id: BigInt(id) },
    data: {
      siteName: siteName || existing.siteName,
      address: address !== undefined ? address : existing.address,
    },
  });

  return NextResponse.json({
    ...site,
    id: site.id.toString(),
    tenantId: site.tenantId.toString(),
  });
}

export async function DELETE(
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

  // Verify ownership
  const existing = await prisma.tenantSite.findFirst({
    where: { id: BigInt(id), tenantId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Delete zones first
  await prisma.siteZone.deleteMany({
    where: { siteId: BigInt(id) },
  });

  // Delete site
  await prisma.tenantSite.delete({
    where: { id: BigInt(id) },
  });

  return NextResponse.json({ success: true });
}
