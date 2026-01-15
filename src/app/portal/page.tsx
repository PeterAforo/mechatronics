import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, Zap, Thermometer, Cpu, Power, PowerOff,
  ChevronRight, Wifi, WifiOff, AlertTriangle, Bell,
  Lightbulb, TrendingUp, TrendingDown, Clock, Sparkles,
  CheckCircle2, XCircle, Activity
} from "lucide-react";

export default async function TenantPortalPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.userType !== "tenant") {
    if (session.user.userType === "admin") {
      redirect("/admin");
    }
    redirect("/login");
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;

  // Get tenant's devices with inventory, subscription, and latest telemetry
  const devices = tenantId ? await prisma.tenantDevice.findMany({
    where: { tenantId },
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
    orderBy: { createdAt: "desc" },
  }) : [];

  // Get latest telemetry KV for each device
  const deviceIds = devices.map(d => d.id);
  const latestTelemetryKv = deviceIds.length > 0 ? await prisma.telemetryKv.findMany({
    where: { 
      tenantDeviceId: { in: deviceIds }
    },
    orderBy: { capturedAt: "desc" },
  }) : [];

  // Group telemetry by device and get latest values per variable
  const telemetryByDevice = new Map<string, { capturedAt: Date; readings: Map<string, number> }>();
  for (const kv of latestTelemetryKv) {
    const deviceKey = kv.tenantDeviceId.toString();
    if (!telemetryByDevice.has(deviceKey)) {
      telemetryByDevice.set(deviceKey, { 
        capturedAt: kv.capturedAt, 
        readings: new Map() 
      });
    }
    const deviceData = telemetryByDevice.get(deviceKey)!;
    // Only add if we don't have this variable yet (since ordered by desc, first is latest)
    if (!deviceData.readings.has(kv.variableCode)) {
      deviceData.readings.set(kv.variableCode, Number(kv.value));
    }
  }

  // Get tenant's active subscriptions with product info
  const subscriptions = tenantId ? await prisma.subscription.findMany({
    where: { tenantId, status: "active" },
    include: {
      product: true,
      tenantDevices: {
        include: {
          inventory: {
            include: {
              deviceType: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  }) : [];

  // Get all alerts (open)
  const alerts = tenantId ? await prisma.alert.findMany({
    where: { tenantId, status: "open" },
    orderBy: { createdAt: "desc" },
    take: 5,
  }) : [];

  // Calculate stats based on telemetry activity (3-hour threshold)
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  
  // Online = has sent telemetry data within last 3 hours
  const devicesOnline = devices.filter(d => d.lastSeenAt && d.lastSeenAt >= threeHoursAgo).length;
  const devicesOffline = devices.filter(d => !d.lastSeenAt || d.lastSeenAt < threeHoursAgo).length;
  const devicesTotal = devices.length;

  // Category icons mapping
  const categoryIcons: Record<string, React.ReactNode> = {
    water: <Droplets className="h-5 w-5 text-blue-500" />,
    power: <Zap className="h-5 w-5 text-yellow-500" />,
    environment: <Thermometer className="h-5 w-5 text-red-500" />,
  };

  // Generate AI insights based on device data
  const generateAIInsights = () => {
    const insights: { id: string; type: "tip" | "warning" | "recommendation"; title: string; description: string; icon: React.ReactNode }[] = [];
    
    // Check for offline devices (no data in >3 hours)
    const offlineDevices = devices.filter(d => !d.lastSeenAt || d.lastSeenAt < threeHoursAgo);
    if (offlineDevices.length > 0) {
      insights.push({
        id: "offline",
        type: "warning",
        title: "Devices Offline",
        description: `${offlineDevices.length} device(s) haven't sent data in over 3 hours. Check connectivity or power supply.`,
        icon: <WifiOff className="h-5 w-5 text-red-500" />,
      });
    }

    // Check for devices with no recent data (>24 hours but not in the offline warning)
    const staleDevices = devices.filter(d => {
      if (!d.lastSeenAt) return false; // Already counted as offline
      const hoursSinceLastData = (now.getTime() - d.lastSeenAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceLastData > 24;
    });
    if (staleDevices.length > 0 && staleDevices.length < devices.length) {
      insights.push({
        id: "stale",
        type: "tip",
        title: "Data Sync Check",
        description: `${staleDevices.length} device(s) haven't sent data in 24+ hours. Consider checking their status.`,
        icon: <Clock className="h-5 w-5 text-amber-500" />,
      });
    }

    // General recommendations
    if (devices.length > 0 && alerts.length === 0) {
      insights.push({
        id: "healthy",
        type: "recommendation",
        title: "System Running Smoothly",
        description: "All your devices are operating within normal parameters. Great job maintaining your system!",
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    }

    if (subscriptions.length > 0) {
      insights.push({
        id: "optimize",
        type: "tip",
        title: "Optimization Tip",
        description: "Set up alert rules to get notified when readings exceed thresholds. This helps prevent issues before they occur.",
        icon: <Lightbulb className="h-5 w-5 text-purple-500" />,
      });
    }

    return insights.slice(0, 3);
  };

  const aiInsights = generateAIInsights();

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <main className="p-4 md:p-6">
      {/* Welcome Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Welcome back, {session.user.name?.split(" ")[0] || "User"}!
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s an overview of your IoT devices and subscriptions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          {/* Active Subscriptions with Device Status */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Active Subscriptions</h2>
                <p className="text-sm text-gray-500 mt-0.5">{subscriptions.length} subscription(s) active</p>
              </div>
              <Link href="/portal/subscriptions" className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.map((sub) => {
                  const device = sub.tenantDevices?.[0]; // Get first device for this subscription
                  const telemetry = device ? telemetryByDevice.get(device.id.toString()) : null;
                  // Online = has sent data within last 3 hours
                  const isOnline = device?.lastSeenAt && device.lastSeenAt >= threeHoursAgo;
                  const lastDataTime = telemetry?.capturedAt;
                  const readings = telemetry?.readings;
                  
                  return (
                    <div 
                      key={sub.id.toString()}
                      className="border border-gray-100 rounded-xl p-4 hover:border-purple-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${
                            sub.product?.category === "water" ? "bg-blue-50" :
                            sub.product?.category === "power" ? "bg-yellow-50" :
                            sub.product?.category === "environment" ? "bg-red-50" :
                            "bg-purple-50"
                          }`}>
                            {categoryIcons[sub.product?.category || ""] || <Cpu className="h-6 w-6 text-purple-500" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{sub.product?.name}</h3>
                            <p className="text-sm text-gray-500">
                              {sub.currency} {Number(sub.monthlyFee).toFixed(0)}/month • Since {new Date(sub.startDate).toLocaleDateString()}
                            </p>
                            {device && (
                              <p className="text-xs text-gray-400 mt-1">
                                Serial: {device.inventory?.serialNumber || "N/A"}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Device Status */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            {isOnline ? (
                              <>
                                <Power className="h-4 w-4 text-green-500" />
                                <Badge className="bg-green-100 text-green-700 border-0">ON</Badge>
                              </>
                            ) : (
                              <>
                                <PowerOff className="h-4 w-4 text-gray-400" />
                                <Badge className="bg-gray-100 text-gray-600 border-0">OFF</Badge>
                              </>
                            )}
                          </div>
                          {lastDataTime && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last data: {formatTimeAgo(lastDataTime)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Device Readings */}
                      {readings && readings.size > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-3">LATEST READINGS</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Array.from(readings.entries()).slice(0, 4).map(([key, value]: [string, number], idx: number) => (
                              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, " ")}</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {value.toFixed(1)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No telemetry yet */}
                      {device && !telemetry && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Activity className="h-4 w-4" />
                            <span>Waiting for first data transmission...</span>
                          </div>
                        </div>
                      )}

                      {/* No device assigned */}
                      {!device && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-amber-600 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>Device pending installation</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <Cpu className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No active subscriptions yet</p>
                <Link 
                  href="/"
                  className="inline-block px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            )}
          </div>

          {/* All Devices Status Grid */}
          {devices.length > 0 && (
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Device Status</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{devicesOnline} of {devicesTotal} online</p>
                </div>
                <Link href="/portal/devices" className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center gap-1">
                  Manage <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map((device) => {
                  const telemetry = telemetryByDevice.get(device.id.toString());
                  // Online = has sent data within last 3 hours
                  const isOnline = device.lastSeenAt && device.lastSeenAt >= threeHoursAgo;
                  
                  return (
                    <Link
                      key={device.id.toString()}
                      href={`/portal/devices/${device.id}`}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${isOnline ? "bg-green-100" : "bg-gray-200"}`}>
                        {isOnline ? (
                          <Wifi className="h-4 w-4 text-green-600" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {device.nickname || device.subscription?.product?.name || `Device ${device.id}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {telemetry ? formatTimeAgo(telemetry.capturedAt) : "No data yet"}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - AI Advisor & Alerts */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          {/* AI Advisor Card */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-semibold">AI Advisor</h3>
            </div>
            <p className="text-purple-100 text-sm mb-4">
              Get intelligent insights and recommendations based on your device data and usage patterns.
            </p>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-300" />
                <span className="text-sm font-medium">System Health</span>
              </div>
              <p className="text-2xl font-bold">
                {devicesTotal > 0 ? Math.round((devicesOnline / devicesTotal) * 100) : 0}%
              </p>
              <p className="text-xs text-purple-200 mt-1">
                {devicesOnline} of {devicesTotal} devices operational
              </p>
            </div>
          </div>

          {/* AI Insights & Recommendations */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">AI Recommendations</h3>
              <Lightbulb className="h-5 w-5 text-purple-500" />
            </div>
            <div className="space-y-3">
              {aiInsights.length > 0 ? aiInsights.map((insight) => (
                <div 
                  key={insight.id}
                  className={`p-4 rounded-xl ${
                    insight.type === "warning" ? "bg-red-50 border border-red-100" :
                    insight.type === "tip" ? "bg-amber-50 border border-amber-100" :
                    "bg-green-50 border border-green-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {insight.icon}
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{insight.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-gray-500">
                  <Sparkles className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">Add devices to get AI insights</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Alerts</h3>
              <Link href="/portal/alerts" className="p-1 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
            <div className="space-y-3">
              {alerts.length > 0 ? alerts.map((alert) => (
                <div key={alert.id.toString()} className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <AlertTriangle className={`h-4 w-4 ${
                      alert.severity === "critical" ? "text-red-600" :
                      alert.severity === "warning" ? "text-yellow-600" :
                      "text-blue-600"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(alert.createdAt)}
                    </p>
                  </div>
                  <Badge className={`text-xs border-0 ${
                    alert.severity === "critical" ? "bg-red-100 text-red-700" :
                    alert.severity === "warning" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {alert.severity}
                  </Badge>
                </div>
              )) : (
                <div className="text-center py-6 text-gray-500">
                  <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No active alerts</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {devices.filter(d => d.inventory?.deviceType?.category === "water").length}
                </p>
                <p className="text-xs text-gray-500">Water Devices</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 text-center">
                <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {devices.filter(d => d.inventory?.deviceType?.category === "power").length}
                </p>
                <p className="text-xs text-gray-500">Power Devices</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <Thermometer className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {devices.filter(d => d.inventory?.deviceType?.category === "environment").length}
                </p>
                <p className="text-xs text-gray-500">Temp Devices</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <Activity className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                <p className="text-xs text-gray-500">Active Alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
