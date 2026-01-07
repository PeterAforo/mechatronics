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

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: session.user.name || "",
    email: session.user.email || "",
    phone: tenant.phone || "",
    companyName: tenant.companyName || "",
    address: tenant.address || "",
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "tenant") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 400 });
  }

  const body = await req.json();
  const { name, phone, companyName, address } = body;

  // Update tenant
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      phone: phone || null,
      companyName: companyName || null,
      address: address || null,
    },
  });

  // Update tenant user name if provided
  if (name && session.user.id) {
    await prisma.tenantUser.update({
      where: { id: BigInt(session.user.id) },
      data: { fullName: name },
    });
  }

  return NextResponse.json({ success: true });
}
