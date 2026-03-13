import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatAccraDate } from "@/lib/timezone";

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
  const url = new URL(req.url);
  
  // Date range parameters
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const variableCode = url.searchParams.get("variable");
  const aggregation = url.searchParams.get("aggregation") || "raw"; // raw, hourly, daily
  const limit = parseInt(url.searchParams.get("limit") || "1000");
  const page = parseInt(url.searchParams.get("page") || "1");
  
  // Compare period parameters (for comparison feature)
  const compareStartDate = url.searchParams.get("compareStartDate");
  const compareEndDate = url.searchParams.get("compareEndDate");

  // Verify device belongs to tenant
  const device = await prisma.tenantDevice.findFirst({
    where: {
      id: BigInt(id),
      tenantId,
    },
    include: {
      inventory: true,
    },
  });

  if (!device) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  // Get device type and variables
  const deviceType = device.inventory?.deviceTypeId
    ? await prisma.deviceType.findUnique({
        where: { id: device.inventory.deviceTypeId },
      })
    : null;

  const variables = deviceType
    ? await prisma.deviceTypeVariable.findMany({
        where: { deviceTypeId: deviceType.id },
        orderBy: { displayOrder: "asc" },
      })
    : [];

  // Build date filters
  const now = new Date();
  const defaultStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  
  const start = startDate ? new Date(startDate) : defaultStartDate;
  const end = endDate ? new Date(endDate) : now;

  // Build where clause
  const whereClause: {
    tenantDeviceId: bigint;
    capturedAt: { gte: Date; lte: Date };
    variableCode?: string;
  } = {
    tenantDeviceId: device.id,
    capturedAt: { gte: start, lte: end },
  };

  if (variableCode) {
    whereClause.variableCode = variableCode;
  }

  // Get total count for pagination
  const totalCount = await prisma.telemetryKv.count({ where: whereClause });

  // Get telemetry data
  const telemetry = await prisma.telemetryKv.findMany({
    where: whereClause,
    orderBy: { capturedAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  // Group by variable and format data
  const readings: Record<string, Array<{ time: string; value: number; formattedTime: string }>> = {};
  
  for (const reading of telemetry.reverse()) {
    const code = reading.variableCode;
    if (!readings[code]) {
      readings[code] = [];
    }
    readings[code].push({
      time: reading.capturedAt.toISOString(),
      value: Number(reading.value),
      formattedTime: formatAccraDate(reading.capturedAt, { 
        month: "short", 
        day: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
    });
  }

  // Calculate statistics for each variable
  const stats: Record<string, { 
    min: number; 
    max: number; 
    avg: number; 
    count: number;
    first: number;
    last: number;
    change: number;
    changePercent: number;
  }> = {};
  
  for (const [code, data] of Object.entries(readings)) {
    const values = data.map(r => r.value);
    const first = values[0] || 0;
    const last = values[values.length - 1] || 0;
    const change = last - first;
    const changePercent = first !== 0 ? (change / first) * 100 : 0;
    
    stats[code] = {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
      first,
      last,
      change,
      changePercent,
    };
  }

  // Aggregate data if requested
  let aggregatedReadings = readings;
  
  if (aggregation === "hourly" || aggregation === "daily") {
    aggregatedReadings = {};
    
    for (const [code, data] of Object.entries(readings)) {
      const buckets: Record<string, number[]> = {};
      
      for (const reading of data) {
        const date = new Date(reading.time);
        let bucketKey: string;
        
        if (aggregation === "hourly") {
          bucketKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:00`;
        } else {
          bucketKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        }
        
        if (!buckets[bucketKey]) {
          buckets[bucketKey] = [];
        }
        buckets[bucketKey].push(reading.value);
      }
      
      aggregatedReadings[code] = Object.entries(buckets).map(([time, values]) => ({
        time,
        value: values.reduce((a, b) => a + b, 0) / values.length,
        formattedTime: time,
      }));
    }
  }

  // Handle comparison period if requested
  let comparisonData: Record<string, Array<{ time: string; value: number }>> | null = null;
  let comparisonStats: Record<string, { min: number; max: number; avg: number; count: number }> | null = null;
  
  if (compareStartDate && compareEndDate) {
    const compareStart = new Date(compareStartDate);
    const compareEnd = new Date(compareEndDate);
    
    const compareWhereClause: {
      tenantDeviceId: bigint;
      capturedAt: { gte: Date; lte: Date };
      variableCode?: string;
    } = {
      tenantDeviceId: device.id,
      capturedAt: { gte: compareStart, lte: compareEnd },
    };
    
    if (variableCode) {
      compareWhereClause.variableCode = variableCode;
    }
    
    const compareTelemetry = await prisma.telemetryKv.findMany({
      where: compareWhereClause,
      orderBy: { capturedAt: "desc" },
      take: limit,
    });
    
    comparisonData = {};
    for (const reading of compareTelemetry.reverse()) {
      const code = reading.variableCode;
      if (!comparisonData[code]) {
        comparisonData[code] = [];
      }
      comparisonData[code].push({
        time: reading.capturedAt.toISOString(),
        value: Number(reading.value),
      });
    }
    
    comparisonStats = {};
    for (const [code, data] of Object.entries(comparisonData)) {
      const values = data.map(r => r.value);
      comparisonStats[code] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        count: values.length,
      };
    }
  }

  return NextResponse.json({
    device: {
      id: device.id.toString(),
      nickname: device.nickname,
      status: device.status,
      serialNumber: device.inventory?.serialNumber,
    },
    deviceType: deviceType ? {
      id: deviceType.id.toString(),
      name: deviceType.name,
      category: deviceType.category,
    } : null,
    variables: variables.map(v => ({
      code: v.variableCode,
      label: v.label,
      unit: v.unit,
      category: v.variableCategory,
      minValue: v.minValue ? Number(v.minValue) : null,
      maxValue: v.maxValue ? Number(v.maxValue) : null,
    })),
    dateRange: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
    aggregation,
    readings: aggregatedReadings,
    stats,
    comparison: comparisonData ? {
      dateRange: {
        start: compareStartDate,
        end: compareEndDate,
      },
      readings: comparisonData,
      stats: comparisonStats,
    } : null,
  });
}
