import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/settings - Get all settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.systemSetting.findMany({
      orderBy: { category: "asc" },
    });

    // Convert to key-value object grouped by category
    const grouped: Record<string, Record<string, string>> = {};
    for (const setting of settings) {
      if (!grouped[setting.category]) {
        grouped[setting.category] = {};
      }
      grouped[setting.category][setting.key] = setting.value;
    }

    return NextResponse.json(grouped);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/settings - Update settings
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Invalid settings format" }, { status: 400 });
    }

    // Upsert each setting
    const updates = [];
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        updates.push(
          prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: {
              key,
              value: String(value),
              category: getCategoryForKey(key),
            },
          })
        );
      }
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: "Settings updated" });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getCategoryForKey(key: string): string {
  if (key.startsWith("email_") || key.startsWith("smtp_")) return "email";
  if (key.startsWith("sms_") || key.startsWith("hubtel_")) return "sms";
  if (key.startsWith("payment_") || key.startsWith("paystack_")) return "payment";
  if (key.startsWith("notification_")) return "notifications";
  return "general";
}
