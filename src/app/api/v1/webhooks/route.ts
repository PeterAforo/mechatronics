import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateApiKey, hasScope, apiError, apiSuccess } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return apiError("Invalid or missing API key", 401);
  }

  if (!hasScope(auth, "read") && !hasScope(auth, "webhooks:read")) {
    return apiError("Insufficient permissions", 403);
  }

  // For now, return webhook configuration info
  // In production, this would fetch from a webhooks table
  return apiSuccess({
    webhooks: [],
    availableEvents: [
      "device.online",
      "device.offline",
      "alert.created",
      "alert.resolved",
      "telemetry.received",
      "subscription.created",
      "subscription.cancelled",
    ],
  });
}

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request);
  if (!auth) {
    return apiError("Invalid or missing API key", 401);
  }

  if (!hasScope(auth, "write") && !hasScope(auth, "webhooks:write")) {
    return apiError("Insufficient permissions", 403);
  }

  try {
    const body = await request.json();
    const { url, events, secret } = body;

    if (!url || !events || !Array.isArray(events)) {
      return apiError("url and events array required");
    }

    // In production, save to webhooks table
    // For now, return success with mock data
    return apiSuccess({
      id: "wh_" + Date.now(),
      url,
      events,
      secret: secret || "whsec_" + Math.random().toString(36).substring(2),
      active: true,
      createdAt: new Date(),
    }, 201);
  } catch {
    return apiError("Invalid request body");
  }
}
