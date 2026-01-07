import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateCSV, generateExcelXML, generateHTMLReport, type ExportData } from "@/lib/export";

// GET /api/portal/reports/export - Export report data
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "tenant") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    const reportType = request.nextUrl.searchParams.get("type") || "telemetry";
    const format = request.nextUrl.searchParams.get("format") || "csv";
    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    let exportData: ExportData;

    switch (reportType) {
      case "telemetry":
        exportData = await getTelemetryExport(tenantId, dateFilter);
        break;
      case "alerts":
        exportData = await getAlertsExport(tenantId, dateFilter);
        break;
      case "devices":
        exportData = await getDevicesExport(tenantId);
        break;
      case "billing":
        exportData = await getBillingExport(tenantId, dateFilter);
        break;
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    let content: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case "csv":
        content = generateCSV(exportData);
        contentType = "text/csv";
        filename = `${reportType}_report_${Date.now()}.csv`;
        break;
      case "excel":
        content = generateExcelXML(exportData);
        contentType = "application/vnd.ms-excel";
        filename = `${reportType}_report_${Date.now()}.xls`;
        break;
      case "pdf":
        content = generateHTMLReport(exportData);
        contentType = "text/html";
        filename = `${reportType}_report_${Date.now()}.html`;
        break;
      default:
        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getTelemetryExport(
  tenantId: bigint,
  dateFilter: { gte?: Date; lte?: Date }
): Promise<ExportData> {
  const where: Record<string, unknown> = { tenantId };
  if (Object.keys(dateFilter).length > 0) {
    where.capturedAt = dateFilter;
  }

  const telemetry = await prisma.telemetryKv.findMany({
    where,
    orderBy: { capturedAt: "desc" },
    take: 5000,
  });

  return {
    title: "Telemetry Report",
    subtitle: `Data from ${dateFilter.gte?.toLocaleDateString() || "all time"} to ${dateFilter.lte?.toLocaleDateString() || "now"}`,
    columns: [
      { key: "timestamp", header: "Timestamp" },
      { key: "deviceId", header: "Device ID" },
      { key: "variableCode", header: "Variable" },
      { key: "value", header: "Value" },
    ],
    rows: telemetry.map((t) => ({
      timestamp: t.capturedAt.toISOString(),
      deviceId: t.tenantDeviceId.toString(),
      variableCode: t.variableCode,
      value: Number(t.value),
    })),
    generatedAt: new Date(),
  };
}

async function getAlertsExport(
  tenantId: bigint,
  dateFilter: { gte?: Date; lte?: Date }
): Promise<ExportData> {
  const where: Record<string, unknown> = { tenantId };
  if (Object.keys(dateFilter).length > 0) {
    where.createdAt = dateFilter;
  }

  const alerts = await prisma.alert.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  return {
    title: "Alerts Report",
    subtitle: `Alerts from ${dateFilter.gte?.toLocaleDateString() || "all time"} to ${dateFilter.lte?.toLocaleDateString() || "now"}`,
    columns: [
      { key: "timestamp", header: "Timestamp" },
      { key: "deviceId", header: "Device ID" },
      { key: "title", header: "Alert Title" },
      { key: "severity", header: "Severity" },
      { key: "status", header: "Status" },
      { key: "value", header: "Value" },
    ],
    rows: alerts.map((a) => ({
      timestamp: a.createdAt.toISOString(),
      deviceId: a.tenantDeviceId.toString(),
      title: a.title,
      severity: a.severity,
      status: a.status,
      value: Number(a.value),
    })),
    generatedAt: new Date(),
  };
}

async function getDevicesExport(tenantId: bigint): Promise<ExportData> {
  const devices = await prisma.tenantDevice.findMany({
    where: { tenantId },
  });

  // Fetch related data separately
  const inventoryIds = devices.map(d => d.inventoryId);
  const siteIds = devices.filter(d => d.siteId).map(d => d.siteId as bigint);
  
  const inventories = await prisma.deviceInventory.findMany({ where: { id: { in: inventoryIds } } });
  const sites = siteIds.length > 0 
    ? await prisma.$queryRaw<Array<{ id: bigint; siteName: string }>>`SELECT id, site_name as "siteName" FROM tenant_sites WHERE id = ANY(${siteIds})`
    : [];

  const inventoryMap = new Map(inventories.map((i: { id: bigint; serialNumber: string }) => [i.id.toString(), i]));
  const siteMap = new Map(sites.map((s: { id: bigint; siteName: string }) => [s.id.toString(), s]));

  return {
    title: "Devices Report",
    subtitle: "All registered devices",
    columns: [
      { key: "id", header: "Device ID" },
      { key: "name", header: "Name" },
      { key: "serialNumber", header: "Serial Number" },
      { key: "status", header: "Status" },
      { key: "site", header: "Site" },
      { key: "lastSeen", header: "Last Seen" },
    ],
    rows: devices.map((d) => {
      const inventory = inventoryMap.get(d.inventoryId.toString());
      const site = d.siteId ? siteMap.get(d.siteId.toString()) : null;
      return {
        id: d.id.toString(),
        name: d.nickname || `Device ${d.id}`,
        serialNumber: inventory?.serialNumber || "N/A",
        status: d.status,
        site: site?.siteName || "Unassigned",
        lastSeen: d.lastSeenAt?.toISOString() || "Never",
      };
    }),
    generatedAt: new Date(),
  };
}

async function getBillingExport(
  tenantId: bigint,
  dateFilter: { gte?: Date; lte?: Date }
): Promise<ExportData> {
  const where: Record<string, unknown> = { tenantId };
  if (Object.keys(dateFilter).length > 0) {
    where.createdAt = dateFilter;
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const rows: Record<string, unknown>[] = [];
  for (const order of orders) {
    for (const item of order.items) {
      rows.push({
        date: order.createdAt.toISOString().split("T")[0],
        orderRef: order.orderRef,
        product: item.product.name,
        quantity: item.quantity,
        amount: `${order.currency} ${Number(item.lineTotal).toFixed(2)}`,
        status: order.status,
      });
    }
  }

  return {
    title: "Billing Report",
    subtitle: `Orders from ${dateFilter.gte?.toLocaleDateString() || "all time"} to ${dateFilter.lte?.toLocaleDateString() || "now"}`,
    columns: [
      { key: "date", header: "Date" },
      { key: "orderRef", header: "Order Ref" },
      { key: "product", header: "Product" },
      { key: "quantity", header: "Qty" },
      { key: "amount", header: "Amount" },
      { key: "status", header: "Status" },
    ],
    rows,
    generatedAt: new Date(),
  };
}
