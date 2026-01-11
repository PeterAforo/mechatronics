import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const search = searchParams.get("search");
  const tenantId = searchParams.get("tenantId");

  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  
  if (search) {
    where.OR = [
      { fromAddress: { contains: search, mode: "insensitive" } },
      { rawText: { contains: search, mode: "insensitive" } },
    ];
  }
  
  if (tenantId) {
    where.tenantId = BigInt(tenantId);
  }

  const [messages, total] = await Promise.all([
    prisma.inboundMessage.findMany({
      where,
      orderBy: { receivedAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.inboundMessage.count({ where }),
  ]);

  // Get tenant info separately if needed
  const tenantIds = [...new Set(messages.filter(m => m.tenantId).map(m => m.tenantId!))];
  const tenants = tenantIds.length > 0 
    ? await prisma.tenant.findMany({
        where: { id: { in: tenantIds } },
        select: { id: true, companyName: true, tenantCode: true },
      })
    : [];
  const tenantMap = new Map(tenants.map(t => [t.id.toString(), t]));

  return NextResponse.json({
    messages: messages.map((m) => {
      const tenant = m.tenantId ? tenantMap.get(m.tenantId.toString()) : null;
      return {
        id: m.id.toString(),
        tenantDeviceId: m.tenantDeviceId?.toString() || null,
        inventoryId: m.inventoryId?.toString() || null,
        tenantId: m.tenantId?.toString(),
        tenantName: tenant?.companyName || null,
        tenantCode: tenant?.tenantCode || null,
        rawPayload: m.rawText,
        source: m.source,
        fromAddress: m.fromAddress,
        status: m.parseStatus,
        parseError: m.parseError,
        receivedAt: m.receivedAt.toISOString(),
      };
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
