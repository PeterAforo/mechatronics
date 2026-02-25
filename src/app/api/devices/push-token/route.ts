import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { validateAccessToken } from "@/lib/mobile-auth";

const registerSchema = z.object({
  token: z.string().min(1, "Push token is required"),
  platform: z.enum(["ios", "android"]),
  deviceId: z.string().optional(),
});

/**
 * POST /api/devices/push-token - Register a push notification token
 */
export async function POST(request: Request) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const user = await validateAccessToken(accessToken);

    if (!user || user.userType !== "tenant") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, platform, deviceId } = validation.data;

    // Upsert the push token
    await prisma.devicePushToken.upsert({
      where: {
        userId_token: {
          userId: BigInt(user.id),
          token,
        },
      },
      update: {
        platform,
        deviceId,
        updatedAt: new Date(),
      },
      create: {
        userId: BigInt(user.id),
        tenantId: BigInt(user.tenantId!),
        token,
        platform,
        deviceId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Push token registered successfully",
    });
  } catch (error) {
    console.error("Push token registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/devices/push-token - Unregister a push notification token
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    await prisma.devicePushToken.deleteMany({
      where: { token },
    });

    return NextResponse.json({
      success: true,
      message: "Push token unregistered successfully",
    });
  } catch (error) {
    console.error("Push token unregistration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
