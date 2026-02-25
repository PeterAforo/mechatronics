import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { revokeRefreshToken } from "@/lib/mobile-auth";

const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
  pushToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = logoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { refreshToken, pushToken } = validation.data;

    // Revoke the refresh token
    await revokeRefreshToken(refreshToken);

    // Unregister push token if provided
    if (pushToken) {
      await prisma.devicePushToken.deleteMany({
        where: { token: pushToken },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Mobile logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
