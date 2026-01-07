import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Legacy Telemetry Ingestion Endpoint
 * 
 * This endpoint is backward-compatible with the old PHP script format.
 * 
 * FIRMWARE CONFIGURATION:
 * =======================
 * File: /api/ingest/legacy
 * 
 * URL Format (GET):
 * https://your-domain.com/api/ingest/legacy?temp=VAR1:VAL1/VAR2:VAL2&hum=CODE&CID=TENANT_ID&DID=DEVICE_SERIAL
 * 
 * Parameters:
 * - temp: Variable data in format "VAR1:VALUE1/VAR2:VALUE2/VAR3:VALUE3"
 * - hum: Message code/identifier (stored as metricCode)
 * - CID: Client/Tenant ID (legacy) or Tenant Code
 * - DID: Device ID - can be serial number or legacy device ID
 * 
 * Example:
 * /api/ingest/legacy?temp=T:25.5/H:60.2/P:1013&hum=ENV01&CID=1&DID=TMP100-ABC123
 * 
 * This will parse and store:
 * - T = 25.5 (Temperature)
 * - H = 60.2 (Humidity)
 * - P = 1013 (Pressure)
 * 
 * Response:
 * - Success: { success: true, message: "...", readings: 3 }
 * - Error: { error: "..." }
 */

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    
    // Parse legacy parameters
    const temp = url.searchParams.get("temp") || "";
    const hum = url.searchParams.get("hum") || "";
    const cid = url.searchParams.get("CID") || url.searchParams.get("cid") || "";
    const did = url.searchParams.get("DID") || url.searchParams.get("did") || "";

    if (!did) {
      return NextResponse.json(
        { error: "Missing DID (Device ID) parameter" },
        { status: 400 }
      );
    }

    if (!temp) {
      return NextResponse.json(
        { error: "Missing temp (data) parameter" },
        { status: 400 }
      );
    }

    // Find device by serial number or legacy ID
    let inventory = await prisma.deviceInventory.findUnique({
      where: { serialNumber: did },
    });

    if (!inventory) {
      inventory = await prisma.deviceInventory.findUnique({
        where: { legacyDeviceId: did },
      });
    }

    // If still not found, try to find by numeric ID (legacy support)
    if (!inventory && /^\d+$/.test(did)) {
      inventory = await prisma.deviceInventory.findFirst({
        where: { legacyDeviceId: did },
      });
    }

    if (!inventory) {
      return NextResponse.json(
        { error: `Device not found: ${did}` },
        { status: 404 }
      );
    }

    // Find tenant device
    const tenantDevice = await prisma.tenantDevice.findFirst({
      where: { inventoryId: inventory.id, status: "active" },
    });

    // Determine tenant ID
    let tenantId: bigint;
    if (tenantDevice) {
      tenantId = tenantDevice.tenantId;
    } else if (cid && /^\d+$/.test(cid)) {
      tenantId = BigInt(cid);
    } else if (cid) {
      // Try to find tenant by code
      const tenant = await prisma.tenant.findUnique({
        where: { tenantCode: cid },
      });
      tenantId = tenant?.id || BigInt(1);
    } else {
      tenantId = BigInt(1); // Default tenant
    }

    // Parse temp data: "VAR1:VALUE1/VAR2:VALUE2/VAR3:VALUE3"
    const segments = temp.split("/").filter(Boolean);
    const parsedData: Record<string, number> = {};

    for (const segment of segments) {
      const parts = segment.split(":");
      if (parts.length === 2) {
        const [variable, value] = parts;
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && variable) {
          parsedData[variable.toUpperCase()] = numValue;
        }
      }
    }

    if (Object.keys(parsedData).length === 0) {
      return NextResponse.json(
        { error: "No valid data parsed from temp parameter" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Store inbound message
    const message = await prisma.inboundMessage.create({
      data: {
        tenantId,
        tenantDeviceId: tenantDevice?.id || null,
        inventoryId: inventory.id,
        source: "http",
        rawText: `temp=${temp}&hum=${hum}&CID=${cid}&DID=${did}`,
        parseStatus: "pending",
      },
    });

    // Store telemetry records
    const telemetryRecords = [];

    if (tenantDevice) {
      for (const [variableCode, value] of Object.entries(parsedData)) {
        const record = await prisma.telemetryKv.create({
          data: {
            tenantId,
            tenantDeviceId: tenantDevice.id,
            messageId: message.id,
            variableCode,
            value,
            capturedAt: now,
          },
        });
        telemetryRecords.push(record);
      }

      // Update device last seen
      await prisma.tenantDevice.update({
        where: { id: tenantDevice.id },
        data: { lastSeenAt: now },
      });
    }

    // Store full payload
    await prisma.telemetryPayload.create({
      data: {
        tenantId,
        tenantDeviceId: tenantDevice?.id || BigInt(0),
        messageId: message.id,
        metricCode: hum || null,
        payload: JSON.stringify(parsedData),
        capturedAt: now,
      },
    });

    // Update message status
    await prisma.inboundMessage.update({
      where: { id: message.id },
      data: { parseStatus: "parsed" },
    });

    // Return success response (compatible with old format)
    const response = [
      `Value 1 = ${temp}`,
      `Value 2 = ${hum}`,
      `Values stored successfully!`,
      `Data inserted successfully into variables table.`,
      `Readings: ${telemetryRecords.length}`,
    ].join("<br/>");

    return new NextResponse(response, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });

  } catch (error) {
    console.error("Legacy ingest error:", error);
    return NextResponse.json(
      { error: "Error inserting values: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: Request) {
  // Convert POST body to URL params and call GET handler
  try {
    const body = await request.json();
    const url = new URL(request.url);
    
    for (const [key, value] of Object.entries(body)) {
      url.searchParams.set(key, String(value));
    }

    // Create a new request with the params
    const newRequest = new Request(url.toString(), {
      method: "GET",
    });

    return GET(newRequest);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
