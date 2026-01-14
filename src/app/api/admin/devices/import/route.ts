import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: "File is empty or has no data rows" }, { status: 400 });
    }

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const requiredHeaders = ["serial_number", "device_type_code"];
    
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        return NextResponse.json({ 
          error: `Missing required column: ${required}` 
        }, { status: 400 });
      }
    }

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const row: Record<string, string> = {};
      
      headers.forEach((header, idx) => {
        row[header] = values[idx] || "";
      });

      try {
        // Find device type
        const deviceType = await prisma.deviceType.findUnique({
          where: { typeCode: row.device_type_code },
        });

        if (!deviceType) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Device type '${row.device_type_code}' not found`);
          continue;
        }

        // Check if serial number already exists
        const existing = await prisma.deviceInventory.findUnique({
          where: { serialNumber: row.serial_number },
        });

        if (existing) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Serial number '${row.serial_number}' already exists`);
          continue;
        }

        // Create inventory item
        await prisma.deviceInventory.create({
          data: {
            deviceTypeId: deviceType.id,
            serialNumber: row.serial_number,
            imei: row.imei || null,
            simNumber: row.sim_number || null,
            firmwareVersion: row.firmware_version || deviceType.firmwareVersion,
            status: "in_stock",
            notes: row.notes || null,
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
