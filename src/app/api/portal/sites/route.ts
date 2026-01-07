import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "tenant") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 400 });
  }

  const sites = await prisma.tenantSite.findMany({
    where: { tenantId },
    include: { zones: true },
    orderBy: { siteName: "asc" },
  });

  return NextResponse.json(
    sites.map((s) => ({
      ...s,
      id: s.id.toString(),
      tenantId: s.tenantId.toString(),
      zones: s.zones.map((z) => ({
        ...z,
        id: z.id.toString(),
        siteId: z.siteId.toString(),
      })),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "tenant") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 400 });
  }

  const body = await req.json();
  const { siteName, address, region, constituency, district, city, country, latitude, longitude } = body;

  if (!siteName) {
    return NextResponse.json({ error: "Site name is required" }, { status: 400 });
  }

  // Build full address from components
  const addressParts = [address, city, district, constituency, region, country].filter(Boolean);
  const fullAddress = addressParts.join(", ");

  const site = await prisma.tenantSite.create({
    data: {
      tenantId,
      siteName,
      address: fullAddress || null,
      city: city || null,
      country: country || "Ghana",
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      status: "active",
    },
  });

  return NextResponse.json({
    ...site,
    id: site.id.toString(),
    tenantId: site.tenantId.toString(),
  });
}
