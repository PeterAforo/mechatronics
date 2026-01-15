import prisma from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

// Device is considered inactive if no data received in this many hours
const INACTIVE_THRESHOLD_HOURS = 3;

export interface DeviceHealthStatus {
  deviceId: bigint;
  serialNumber: string;
  nickname: string | null;
  tenantId: bigint;
  tenantEmail: string;
  tenantName: string;
  lastSeenAt: Date | null;
  hoursSinceLastSeen: number | null;
  status: "online" | "offline" | "never_connected";
  shouldAlert: boolean;
}

/**
 * Check health status of all devices
 * Returns devices that are offline (no data in >3 hours) or never connected
 */
export async function checkAllDevicesHealth(): Promise<DeviceHealthStatus[]> {
  const now = new Date();
  const thresholdTime = new Date(now.getTime() - INACTIVE_THRESHOLD_HOURS * 60 * 60 * 1000);

  // Get all active tenant devices with tenant info
  const devices = await prisma.tenantDevice.findMany({
    where: {
      status: "active",
    },
    include: {
      inventory: true,
      subscription: {
        include: {
          product: true,
        },
      },
    },
  });

  // Get tenant info for each device
  const tenantIds = [...new Set(devices.map(d => d.tenantId))];
  const tenants = await prisma.tenant.findMany({
    where: { id: { in: tenantIds } },
  });
  const tenantMap = new Map(tenants.map(t => [t.id.toString(), t]));

  const healthStatuses: DeviceHealthStatus[] = [];

  for (const device of devices) {
    const tenant = tenantMap.get(device.tenantId.toString());
    if (!tenant) continue;

    let status: "online" | "offline" | "never_connected";
    let hoursSinceLastSeen: number | null = null;
    let shouldAlert = false;

    if (!device.lastSeenAt) {
      status = "never_connected";
      shouldAlert = true; // Alert if device was assigned but never connected
    } else {
      hoursSinceLastSeen = (now.getTime() - device.lastSeenAt.getTime()) / (1000 * 60 * 60);
      
      if (device.lastSeenAt < thresholdTime) {
        status = "offline";
        shouldAlert = true;
      } else {
        status = "online";
      }
    }

    healthStatuses.push({
      deviceId: device.id,
      serialNumber: device.inventory?.serialNumber || `DEV-${device.id}`,
      nickname: device.nickname,
      tenantId: device.tenantId,
      tenantEmail: tenant.email,
      tenantName: tenant.companyName,
      lastSeenAt: device.lastSeenAt,
      hoursSinceLastSeen,
      status,
      shouldAlert,
    });
  }

  return healthStatuses;
}

/**
 * Get offline devices that need alerts
 */
export async function getOfflineDevices(): Promise<DeviceHealthStatus[]> {
  const allStatuses = await checkAllDevicesHealth();
  return allStatuses.filter(s => s.shouldAlert);
}

/**
 * Send alerts for offline devices
 */
export async function sendOfflineDeviceAlerts(): Promise<{
  alertsSent: number;
  errors: string[];
}> {
  const offlineDevices = await getOfflineDevices();
  let alertsSent = 0;
  const errors: string[] = [];

  // Group by tenant to send consolidated alerts
  const devicesByTenant = new Map<string, DeviceHealthStatus[]>();
  for (const device of offlineDevices) {
    const key = device.tenantId.toString();
    if (!devicesByTenant.has(key)) {
      devicesByTenant.set(key, []);
    }
    devicesByTenant.get(key)!.push(device);
  }

  // Send alerts to each tenant
  for (const [tenantId, devices] of devicesByTenant) {
    try {
      const tenant = devices[0]; // Get tenant info from first device
      
      // Create device list for email
      const deviceList = devices.map(d => {
        const lastSeen = d.lastSeenAt 
          ? `Last seen: ${d.hoursSinceLastSeen?.toFixed(1)} hours ago`
          : "Never connected";
        return `- ${d.nickname || d.serialNumber}: ${lastSeen}`;
      }).join("\n");

      // Send email to tenant
      await sendEmail({
        to: tenant.tenantEmail,
        subject: `⚠️ Device Alert: ${devices.length} device(s) offline`,
        html: `
          <h2>Device Connectivity Alert</h2>
          <p>Dear ${tenant.tenantName},</p>
          <p>The following device(s) have stopped sending data and may require attention:</p>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px;">${deviceList}</pre>
          <p><strong>Possible causes:</strong></p>
          <ul>
            <li>Power outage at device location</li>
            <li>Internet/network connectivity issues</li>
            <li>Device hardware malfunction</li>
            <li>SIM card or cellular network issues</li>
          </ul>
          <p>Please check your devices and ensure they are powered on and connected.</p>
          <p>You can view device status in your <a href="${process.env.NEXTAUTH_URL}/portal">dashboard</a>.</p>
          <p>Best regards,<br/>Mechatronics IoT Platform</p>
        `,
        text: `Device Connectivity Alert\n\nThe following devices are offline:\n${deviceList}\n\nPlease check your devices.`,
      });

      // Log the notification
      for (const device of devices) {
        await prisma.notificationLog.create({
          data: {
            tenantId: BigInt(tenantId),
            alertId: null,
            channel: "email",
            recipient: tenant.tenantEmail,
            subject: `Device Offline: ${device.serialNumber}`,
            message: `Device ${device.nickname || device.serialNumber} has been offline for ${device.hoursSinceLastSeen?.toFixed(1) || "unknown"} hours`,
            status: "sent",
            sentAt: new Date(),
          },
        });
      }

      alertsSent += devices.length;
    } catch (error) {
      errors.push(`Failed to send alert to tenant ${tenantId}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Also notify admin about all offline devices
  if (offlineDevices.length > 0) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@mechatronics.com.gh";
      const deviceSummary = offlineDevices.map(d => 
        `${d.tenantName} - ${d.nickname || d.serialNumber}: ${d.status}`
      ).join("\n");

      await sendEmail({
        to: adminEmail,
        subject: `🚨 Admin Alert: ${offlineDevices.length} device(s) offline`,
        html: `
          <h2>System-wide Device Health Report</h2>
          <p><strong>${offlineDevices.length}</strong> device(s) are currently offline or never connected:</p>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px;">${deviceSummary}</pre>
          <p>View details in the <a href="${process.env.NEXTAUTH_URL}/admin/devices">admin dashboard</a>.</p>
        `,
        text: `Admin Alert: ${offlineDevices.length} devices offline\n\n${deviceSummary}`,
      });
    } catch (error) {
      errors.push(`Failed to send admin alert: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return { alertsSent, errors };
}

/**
 * Update device status based on telemetry activity
 * Call this periodically to mark devices as inactive
 */
export async function updateDeviceStatuses(): Promise<{
  updated: number;
  markedInactive: number;
}> {
  const now = new Date();
  const thresholdTime = new Date(now.getTime() - INACTIVE_THRESHOLD_HOURS * 60 * 60 * 1000);

  // Find devices that should be marked inactive
  // (active status but no data in threshold period)
  const staleDevices = await prisma.tenantDevice.findMany({
    where: {
      status: "active",
      OR: [
        { lastSeenAt: null },
        { lastSeenAt: { lt: thresholdTime } },
      ],
    },
  });

  // We don't automatically change status to "inactive" as that's a manual action
  // Instead, we track this in the health check and alerts
  // The status field is for subscription/admin purposes, not connectivity

  return {
    updated: staleDevices.length,
    markedInactive: 0, // We don't auto-change status
  };
}

/**
 * Check if a specific device is online
 */
export async function isDeviceOnline(deviceId: bigint): Promise<boolean> {
  const device = await prisma.tenantDevice.findUnique({
    where: { id: deviceId },
  });

  if (!device || !device.lastSeenAt) return false;

  const thresholdTime = new Date(Date.now() - INACTIVE_THRESHOLD_HOURS * 60 * 60 * 1000);
  return device.lastSeenAt >= thresholdTime;
}

/**
 * Get device connectivity statistics
 */
export async function getDeviceConnectivityStats(): Promise<{
  total: number;
  online: number;
  offline: number;
  neverConnected: number;
}> {
  const statuses = await checkAllDevicesHealth();
  
  return {
    total: statuses.length,
    online: statuses.filter(s => s.status === "online").length,
    offline: statuses.filter(s => s.status === "offline").length,
    neverConnected: statuses.filter(s => s.status === "never_connected").length,
  };
}
