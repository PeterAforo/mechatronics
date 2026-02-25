import { randomBytes, createHash } from "crypto";
import prisma from "./prisma";

const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface MobileTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: string;
}

export interface MobileUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  userType: "tenant" | "admin";
  tenantId?: string;
  tenantName?: string;
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash a token for storage
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Create access and refresh tokens for a user
 */
export async function createMobileTokens(
  userId: bigint,
  userType: "tenant" | "admin",
  deviceId?: string
): Promise<MobileTokens> {
  const accessToken = generateToken();
  const refreshToken = generateToken();
  const refreshTokenHash = hashToken(refreshToken);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      userId,
      userType,
      token: refreshTokenHash,
      deviceId,
      expiresAt,
    },
  });

  return {
    accessToken: `${userId}:${userType}:${accessToken}`,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRY / 1000,
    expiresAt: new Date(Date.now() + ACCESS_TOKEN_EXPIRY).toISOString(),
  };
}

/**
 * Validate and refresh tokens
 */
export async function refreshMobileTokens(
  refreshToken: string,
  deviceId?: string
): Promise<MobileTokens | null> {
  const refreshTokenHash = hashToken(refreshToken);

  // Find the refresh token
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenHash },
  });

  if (!storedToken) {
    return null;
  }

  // Check if token is expired or revoked
  if (storedToken.expiresAt < new Date() || storedToken.revokedAt) {
    return null;
  }

  // Revoke the old refresh token (rotation)
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  // Create new tokens
  return createMobileTokens(storedToken.userId, storedToken.userType, deviceId);
}

/**
 * Revoke a refresh token
 */
export async function revokeRefreshToken(refreshToken: string): Promise<boolean> {
  const refreshTokenHash = hashToken(refreshToken);

  try {
    await prisma.refreshToken.updateMany({
      where: { token: refreshTokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllUserTokens(
  userId: bigint,
  userType: "tenant" | "admin"
): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, userType, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Parse and validate an access token
 * Returns user info if valid, null otherwise
 */
export async function validateAccessToken(
  accessToken: string
): Promise<MobileUser | null> {
  try {
    const parts = accessToken.split(":");
    if (parts.length !== 3) return null;

    const [userIdStr, userType] = parts;
    const userId = BigInt(userIdStr);

    if (userType === "tenant") {
      const user = await prisma.tenantUser.findUnique({
        where: { id: userId },
        include: { tenant: true },
      });

      if (!user || user.status !== "active") return null;

      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        userType: "tenant",
        tenantId: user.tenantId.toString(),
        tenantName: user.tenant.companyName,
      };
    } else if (userType === "admin") {
      const admin = await prisma.adminUser.findUnique({
        where: { id: userId },
      });

      if (!admin || admin.status !== "active") return null;

      return {
        id: admin.id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
        userType: "admin",
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Clean up expired refresh tokens (run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revokedAt: { not: null } },
      ],
    },
  });
  return result.count;
}
