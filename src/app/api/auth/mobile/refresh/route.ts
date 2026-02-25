import { NextResponse } from "next/server";
import { z } from "zod";
import { refreshMobileTokens, validateAccessToken } from "@/lib/mobile-auth";

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
  deviceId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = refreshSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { refreshToken, deviceId } = validation.data;

    // Refresh the tokens
    const tokens = await refreshMobileTokens(refreshToken, deviceId);

    if (!tokens) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // Get user info from the new access token
    const user = await validateAccessToken(tokens.accessToken);

    return NextResponse.json({
      success: true,
      user,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        expiresAt: tokens.expiresAt,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
