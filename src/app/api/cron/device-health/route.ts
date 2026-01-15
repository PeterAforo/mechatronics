import { NextRequest, NextResponse } from "next/server";
import { 
  checkAllDevicesHealth, 
  sendOfflineDeviceAlerts,
  getDeviceConnectivityStats 
} from "@/lib/device-health";

/**
 * Device Health Check Cron Endpoint
 * 
 * This endpoint should be called periodically (e.g., every hour) by:
 * - Vercel Cron Jobs
 * - External cron service (e.g., cron-job.org)
 * - GitHub Actions scheduled workflow
 * 
 * URL: /api/cron/device-health
 * 
 * Security: Requires CRON_SECRET header or query param
 */

export async function GET(req: NextRequest) {
  // Verify cron secret for security
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = req.headers.get("x-cron-secret") || 
                         req.nextUrl.searchParams.get("secret");

  if (cronSecret && providedSecret !== cronSecret) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Get current device health status
    const healthStatuses = await checkAllDevicesHealth();
    const stats = await getDeviceConnectivityStats();

    // Check if we should send alerts (only if there are offline devices)
    const offlineDevices = healthStatuses.filter(s => s.shouldAlert);
    
    let alertResult = { alertsSent: 0, errors: [] as string[] };
    
    if (offlineDevices.length > 0) {
      // Send alerts to tenants and admin
      alertResult = await sendOfflineDeviceAlerts();
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
      offlineDevices: offlineDevices.map(d => ({
        serialNumber: d.serialNumber,
        nickname: d.nickname,
        tenant: d.tenantName,
        status: d.status,
        hoursSinceLastSeen: d.hoursSinceLastSeen?.toFixed(1) || "never",
      })),
      alerts: {
        sent: alertResult.alertsSent,
        errors: alertResult.errors,
      },
    });
  } catch (error) {
    console.error("Device health check error:", error);
    return NextResponse.json(
      { 
        error: "Health check failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Also support POST for webhook-style triggers
export async function POST(req: NextRequest) {
  return GET(req);
}
