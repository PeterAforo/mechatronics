import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Mechatronics IoT Platform API",
    version: "1.0.0",
    documentation: "/api/v1/docs",
    endpoints: {
      devices: "/api/v1/devices",
      telemetry: "/api/v1/telemetry",
      alerts: "/api/v1/alerts",
      reports: "/api/v1/reports",
    },
  });
}
