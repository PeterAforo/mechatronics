import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { createHash } from "crypto";

export interface ApiKeyPayload {
  tenantId: bigint;
  keyId: bigint;
  scopes: string[];
}

export async function validateApiKey(request: NextRequest): Promise<ApiKeyPayload | null> {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.substring(7);
  const keyHash = createHash("sha256").update(apiKey).digest("hex");

  const key = await prisma.apiKey.findUnique({
    where: { keyHash },
  });

  if (!key || !key.isActive) {
    return null;
  }

  if (key.expiresAt && key.expiresAt < new Date()) {
    return null;
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    tenantId: key.tenantId,
    keyId: key.id,
    scopes: key.scopes.split(",").map(s => s.trim()),
  };
}

export function hasScope(payload: ApiKeyPayload, requiredScope: string): boolean {
  return payload.scopes.includes("*") || payload.scopes.includes(requiredScope);
}

export function apiError(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return Response.json({ success: true, data }, { status });
}
