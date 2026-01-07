import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const ingestSchema = z.object({
  tenantDeviceId: z.string().optional(),
  serialNumber: z.string().optional(),
  legacyDeviceId: z.string().optional(),
  source: z.enum(["sms", "http", "mqtt", "import"]).default("http"),
  rawText: z.string().optional(),
  data: z.record(z.union([z.number(), z.string()])).optional(),
});

function parseKeyValuePairs(rawText: string): Record<string, number> {
  const result: Record<string, number> = {};
  
  // Parse formats like: W=20,WP=35.5,WC=100 or W=20 WP=35.5 WC=100
  const pairs = rawText.split(/[,\s]+/).filter(Boolean);
  
  for (const pair of pairs) {
    const match = pair.match(/^([A-Za-z][A-Za-z0-9]*)=(-?\d+\.?\d*)$/);
    if (match) {
      const [, key, value] = match;
      result[key.toUpperCase()] = parseFloat(value);
    }
  }
  
  return result;
}

async function processIngest(
  tenantDeviceId: bigint | null,
  inventoryId: bigint | null,
  tenantId: bigint,
  source: "sms" | "http" | "mqtt" | "import",
  rawText: string,
  data: Record<string, number>
) {
  // Store raw inbound message
  const message = await prisma.inboundMessage.create({
    data: {
      tenantId,
      tenantDeviceId,
      inventoryId,
      source,
      rawText,
      parseStatus: "pending",
    },
  });

  const telemetryRecords = [];
  const now = new Date();

  try {
    // Insert telemetry_kv records
    for (const [variableCode, value] of Object.entries(data)) {
      if (tenantDeviceId) {
        const record = await prisma.telemetryKv.create({
          data: {
            tenantId,
            tenantDeviceId,
            messageId: message.id,
            variableCode: variableCode.toUpperCase(),
            value,
            capturedAt: now,
          },
        });
        telemetryRecords.push(record);
      }
    }

    // Update message parse status
    await prisma.inboundMessage.update({
      where: { id: message.id },
      data: { parseStatus: "parsed" },
    });

    // Update device last_seen_at
    if (tenantDeviceId) {
      await prisma.tenantDevice.update({
        where: { id: tenantDeviceId },
        data: { lastSeenAt: now },
      });
    }

    return { message, telemetryRecords, success: true };
  } catch (error) {
    // Mark message as failed
    await prisma.inboundMessage.update({
      where: { id: message.id },
      data: { 
        parseStatus: "failed",
        parseError: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

// POST /api/ingest - Ingest data from IoT devices
// Supports multiple identification methods and raw text parsing
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = ingestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { tenantDeviceId, serialNumber, legacyDeviceId, source, rawText, data } = validation.data;

    // Must have at least one identifier
    if (!tenantDeviceId && !serialNumber && !legacyDeviceId) {
      return NextResponse.json(
        { error: "Must provide tenantDeviceId, serialNumber, or legacyDeviceId" },
        { status: 400 }
      );
    }

    // Must have data or rawText
    if (!data && !rawText) {
      return NextResponse.json(
        { error: "Must provide data object or rawText to parse" },
        { status: 400 }
      );
    }

    // Find the device
    let tenantDevice = null;
    let inventory = null;

    if (tenantDeviceId) {
      tenantDevice = await prisma.tenantDevice.findUnique({
        where: { id: BigInt(tenantDeviceId) },
        include: { inventory: true },
      });
    } else if (serialNumber) {
      inventory = await prisma.deviceInventory.findUnique({
        where: { serialNumber },
      });
      if (inventory) {
        tenantDevice = await prisma.tenantDevice.findFirst({
          where: { inventoryId: inventory.id, status: "active" },
        });
      }
    } else if (legacyDeviceId) {
      inventory = await prisma.deviceInventory.findUnique({
        where: { legacyDeviceId },
      });
      if (inventory) {
        tenantDevice = await prisma.tenantDevice.findFirst({
          where: { inventoryId: inventory.id, status: "active" },
        });
      }
    }

    if (!tenantDevice && !inventory) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    // Parse data from rawText if not provided directly
    let parsedData = data ? 
      Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, typeof v === "number" ? v : parseFloat(String(v))])
      ) : {};
    
    if (rawText && Object.keys(parsedData).length === 0) {
      parsedData = parseKeyValuePairs(rawText);
    }

    if (Object.keys(parsedData).length === 0) {
      return NextResponse.json(
        { error: "No valid data to ingest" },
        { status: 400 }
      );
    }

    const tenantId = tenantDevice?.tenantId || BigInt(1); // Fallback for unassigned devices
    const result = await processIngest(
      tenantDevice?.id || null,
      inventory?.id || tenantDevice?.inventoryId || null,
      tenantId,
      source,
      rawText || JSON.stringify(data),
      parsedData
    );

    return NextResponse.json({
      success: true,
      message: `Ingested ${result.telemetryRecords.length} readings`,
      messageId: result.message.id.toString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error ingesting data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/ingest - Simple GET endpoint for devices
// Format: /api/ingest?serial=XXX&W=20&WP=35
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const serial = url.searchParams.get("serial") || url.searchParams.get("serialNumber");
    const legacyId = url.searchParams.get("legacyDeviceId");

    if (!serial && !legacyId) {
      return NextResponse.json(
        { error: "Missing serial or legacyDeviceId parameter" },
        { status: 400 }
      );
    }

    // Build data object from query params
    const data: Record<string, number> = {};
    const excludeParams = ["serial", "serialNumber", "legacyDeviceId", "source"];
    
    url.searchParams.forEach((value, key) => {
      if (!excludeParams.includes(key)) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          data[key.toUpperCase()] = numValue;
        }
      }
    });

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No data parameters provided" },
        { status: 400 }
      );
    }

    // Find device
    let inventory = null;
    let tenantDevice = null;

    if (serial) {
      inventory = await prisma.deviceInventory.findUnique({
        where: { serialNumber: serial },
      });
    } else if (legacyId) {
      inventory = await prisma.deviceInventory.findUnique({
        where: { legacyDeviceId: legacyId },
      });
    }

    if (inventory) {
      tenantDevice = await prisma.tenantDevice.findFirst({
        where: { inventoryId: inventory.id, status: "active" },
      });
    }

    if (!inventory) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      );
    }

    const tenantId = tenantDevice?.tenantId || BigInt(1);
    const rawText = Array.from(url.searchParams.entries())
      .filter(([k]) => !excludeParams.includes(k))
      .map(([k, v]) => `${k}=${v}`)
      .join(",");

    const result = await processIngest(
      tenantDevice?.id || null,
      inventory.id,
      tenantId,
      "http",
      rawText,
      data
    );

    return NextResponse.json({
      success: true,
      message: `Ingested ${result.telemetryRecords.length} readings`,
      messageId: result.message.id.toString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error ingesting data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
