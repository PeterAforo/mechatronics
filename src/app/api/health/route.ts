import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Health Check Endpoint
 * 
 * Returns the health status of the application and its dependencies.
 * Used by monitoring systems and load balancers.
 */

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: "up" | "down";
      latency?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  const health: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.1.0",
    uptime: process.uptime(),
    checks: {
      database: { status: "up" },
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
    },
  };

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database.latency = Date.now() - dbStart;
  } catch (error) {
    health.checks.database.status = "down";
    health.checks.database.error = error instanceof Error ? error.message : "Unknown error";
    health.status = "unhealthy";
  }

  // Check memory usage
  if (typeof process !== "undefined" && process.memoryUsage) {
    const memUsage = process.memoryUsage();
    health.checks.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    };

    // Mark as degraded if memory usage is high
    if (health.checks.memory.percentage > 90) {
      health.status = health.status === "healthy" ? "degraded" : health.status;
    }
  }

  // Determine HTTP status code
  const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Response-Time": `${Date.now() - startTime}ms`,
    },
  });
}
