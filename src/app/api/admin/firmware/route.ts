import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/firmware - Get all firmware versions
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const firmware = await prisma.firmwareVersion.findMany({
      orderBy: [{ deviceTypeId: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(
      firmware.map((f) => ({
        id: f.id.toString(),
        deviceTypeId: f.deviceTypeId.toString(),
        version: f.version,
        releaseNotes: f.releaseNotes,
        fileUrl: f.fileUrl,
        fileSize: f.fileSize,
        checksum: f.checksum,
        isStable: f.isStable,
        isMandatory: f.isMandatory,
        createdAt: f.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching firmware:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/firmware - Create new firmware version
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      deviceTypeId,
      version,
      releaseNotes,
      fileUrl,
      fileSize,
      checksum,
      isStable,
      isMandatory,
    } = body;

    if (!deviceTypeId || !version || !fileUrl || !fileSize || !checksum) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if version already exists for this device type
    const existing = await prisma.firmwareVersion.findUnique({
      where: {
        deviceTypeId_version: {
          deviceTypeId: BigInt(deviceTypeId),
          version,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Version already exists for this device type" }, { status: 400 });
    }

    const firmware = await prisma.firmwareVersion.create({
      data: {
        deviceTypeId: BigInt(deviceTypeId),
        version,
        releaseNotes: releaseNotes || null,
        fileUrl,
        fileSize,
        checksum,
        isStable: isStable || false,
        isMandatory: isMandatory || false,
      },
    });

    return NextResponse.json({
      id: firmware.id.toString(),
      deviceTypeId: firmware.deviceTypeId.toString(),
      version: firmware.version,
      createdAt: firmware.createdAt,
    });
  } catch (error) {
    console.error("Error creating firmware:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
