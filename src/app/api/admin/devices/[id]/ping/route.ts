import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Device Ping/Diagnostic Endpoint
 * 
 * This endpoint allows admin to:
 * 1. Check device connectivity status
 * 2. View last known telemetry
 * 3. Queue a diagnostic command (if device supports it)
 * 
 * Note: Most IoT devices are "push-only" (they send data to server)
 * and cannot receive commands unless they:
 * - Poll a command endpoint periodically
 * - Use MQTT with bidirectional communication
 * - Have SMS capability for receiving commands
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Get device with all related info
    const device = await prisma.tenantDevice.findUnique({
      where: { id: BigInt(id) },
      include: {
        inventory: {
          include: {
            deviceType: true,
          },
        },
        subscription: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Get tenant info
    const tenant = await prisma.tenant.findUnique({
      where: { id: device.tenantId },
    });

    // Get last 5 telemetry readings
    const recentTelemetry = await prisma.telemetryKv.findMany({
      where: { tenantDeviceId: device.id },
      orderBy: { capturedAt: "desc" },
      take: 10,
    });

    // Get last inbound message
    const lastMessage = await prisma.inboundMessage.findFirst({
      where: { tenantDeviceId: device.id },
      orderBy: { receivedAt: "desc" },
    });

    // Calculate connectivity status
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);

    let connectivityStatus: "online" | "degraded" | "offline" | "never_connected";
    let hoursSinceLastSeen: number | null = null;

    if (!device.lastSeenAt) {
      connectivityStatus = "never_connected";
    } else {
      hoursSinceLastSeen = (now.getTime() - device.lastSeenAt.getTime()) / (1000 * 60 * 60);
      
      if (device.lastSeenAt >= oneHourAgo) {
        connectivityStatus = "online";
      } else if (device.lastSeenAt >= threeHoursAgo) {
        connectivityStatus = "degraded";
      } else {
        connectivityStatus = "offline";
      }
    }

    // Determine possible issues based on pattern
    const possibleIssues: string[] = [];
    
    if (connectivityStatus === "offline" || connectivityStatus === "never_connected") {
      possibleIssues.push("Power outage at device location");
      possibleIssues.push("Internet/network connectivity issues");
      possibleIssues.push("SIM card or cellular data issues");
      possibleIssues.push("Device hardware malfunction");
      possibleIssues.push("Firmware crash or hang");
    } else if (connectivityStatus === "degraded") {
      possibleIssues.push("Intermittent network connectivity");
      possibleIssues.push("Weak cellular signal");
      possibleIssues.push("Device may be restarting frequently");
    }

    // Check for any pending commands (for devices that support it)
    const pendingCommands = await prisma.deviceOtaUpdate.findMany({
      where: {
        tenantDeviceId: device.id,
        status: "pending",
      },
    });

    // Communication protocol determines what actions are possible
    const protocol = device.inventory?.deviceType?.communicationProtocol || "http";
    const supportedActions: string[] = [];

    switch (protocol) {
      case "mqtt":
        supportedActions.push("send_ping", "request_status", "restart_device", "update_config");
        break;
      case "sms":
        supportedActions.push("send_sms_ping", "request_status_sms");
        break;
      case "http":
        supportedActions.push("wait_for_next_checkin");
        break;
      default:
        supportedActions.push("wait_for_next_checkin");
    }

    return NextResponse.json({
      device: {
        id: device.id.toString(),
        serialNumber: device.inventory?.serialNumber,
        nickname: device.nickname,
        status: device.status,
        installedAt: device.installedAt?.toISOString(),
      },
      connectivity: {
        status: connectivityStatus,
        lastSeenAt: device.lastSeenAt?.toISOString(),
        hoursSinceLastSeen: hoursSinceLastSeen?.toFixed(2),
        possibleIssues,
      },
      deviceType: device.inventory?.deviceType ? {
        name: device.inventory.deviceType.name,
        typeCode: device.inventory.deviceType.typeCode,
        protocol: device.inventory.deviceType.communicationProtocol,
        manufacturer: device.inventory.deviceType.manufacturer,
      } : null,
      tenant: tenant ? {
        id: tenant.id.toString(),
        name: tenant.companyName,
        email: tenant.email,
        phone: tenant.phone,
      } : null,
      recentTelemetry: recentTelemetry.map(t => ({
        variable: t.variableCode,
        value: Number(t.value),
        capturedAt: t.capturedAt.toISOString(),
      })),
      lastMessage: lastMessage ? {
        source: lastMessage.source,
        receivedAt: lastMessage.receivedAt.toISOString(),
        parseStatus: lastMessage.parseStatus,
      } : null,
      diagnostics: {
        supportedActions,
        pendingCommands: pendingCommands.length,
        canSendCommand: protocol === "mqtt" || protocol === "sms",
        recommendation: connectivityStatus === "offline" 
          ? "Contact tenant to physically check the device. Verify power supply and network connectivity."
          : connectivityStatus === "degraded"
          ? "Monitor device. If issues persist, contact tenant to check signal strength."
          : "Device is operating normally.",
      },
    });
  } catch (error) {
    console.error("Device ping error:", error);
    return NextResponse.json(
      { error: "Failed to get device status" },
      { status: 500 }
    );
  }
}

/**
 * POST - Send a command to the device (if supported)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  try {
    const device = await prisma.tenantDevice.findUnique({
      where: { id: BigInt(id) },
      include: {
        inventory: {
          include: {
            deviceType: true,
          },
        },
      },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const protocol = device.inventory?.deviceType?.communicationProtocol;

    // Handle different actions based on protocol
    switch (action) {
      case "send_sms_ping":
        if (protocol !== "sms") {
          return NextResponse.json(
            { error: "Device does not support SMS commands" },
            { status: 400 }
          );
        }
        // TODO: Integrate with SMS provider (mNotify) to send ping command
        // For now, log the request
        await prisma.notificationLog.create({
          data: {
            tenantId: device.tenantId,
            channel: "sms",
            recipient: device.inventory?.simNumber || "unknown",
            subject: "Device Ping",
            message: "STATUS?",
            status: "queued",
          },
        });
        return NextResponse.json({
          success: true,
          message: "SMS ping command queued. Response will be logged when received.",
        });

      case "request_status":
        // For MQTT devices, publish a status request
        // TODO: Integrate with MQTT broker
        return NextResponse.json({
          success: false,
          message: "MQTT command sending not yet implemented. Device will report on next scheduled transmission.",
        });

      case "log_issue":
        // Log a manual issue report
        await prisma.alert.create({
          data: {
            tenantId: device.tenantId,
            tenantDeviceId: device.id,
            variableCode: "CONNECTIVITY",
            value: 0,
            severity: "warning",
            title: "Device Connectivity Issue Reported",
            message: body.notes || "Admin reported connectivity issue with this device.",
            status: "open",
          },
        });
        return NextResponse.json({
          success: true,
          message: "Issue logged successfully.",
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Device command error:", error);
    return NextResponse.json(
      { error: "Failed to send command" },
      { status: 500 }
    );
  }
}
