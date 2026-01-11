import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [".bin", ".hex", ".elf", ".zip"];
    const fileName = file.name.toLowerCase();
    const isValidType = allowedTypes.some((ext) => fileName.endsWith(ext));

    if (!isValidType) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: .bin, .hex, .elf, .zip" },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Calculate checksum (SHA256)
    const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

    // In production, upload to cloud storage (S3, GCS, etc.)
    // For now, we'll store locally or return a placeholder URL
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileUrl = `/uploads/firmware/${timestamp}_${safeFileName}`;

    // Note: In production, you would:
    // 1. Upload to S3/GCS/Azure Blob
    // 2. Return the actual cloud URL
    // For local dev, we'll simulate success

    return NextResponse.json({
      success: true,
      fileUrl,
      fileSize: buffer.length,
      checksum,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Firmware upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
