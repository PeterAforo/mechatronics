import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, Zap, Thermometer, Factory, Heart, Shield,
  Plus, Bell, Building2, ChevronRight, Activity, Cpu
} from "lucide-react";
import { SystemHealthBar } from "@/components/dashboard/SystemHealthBar";
import { AIInsightsWidget } from "@/components/dashboard/AIInsightsWidget";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { DeviceCard } from "@/components/dashboard/DeviceCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PrimaryTrendCard } from "@/components/dashboard/PrimaryTrendCard";
import { HealthGaugeCard } from "@/components/dashboard/HealthGaugeCard";
import { EventsFeedCard } from "@/components/dashboard/EventsFeedCard";
import { CtaPanelCard } from "@/components/dashboard/CtaPanelCard";
import { ConnectivityCard } from "@/components/dashboard/ConnectivityCard";
import { EmptyState } from "@/components/ui/empty-state";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  water: Droplets,
  power: Zap,
  environment: Thermometer,
  industrial: Factory,
  healthcare: Heart,
  security: Shield,
  other: Factory,
};

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

  // Get tenant's devices with inventory and subscription info
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

  // Get tenant's active subscriptions
  const subscriptions = tenantId ? await prisma.subscription.findMany({
    where: { tenantId, status: "active" },
    include: {
      product: true,
    },
    orderBy: { createdAt: "desc" },
  }) : [];

  // Get tenant's pending orders
  const pendingOrders = tenantId ? await prisma.order.findMany({
    where: { tenantId, status: "pending" },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  }) : [];

  // Get tenant's sites
  const sites = tenantId ? await prisma.tenantSite.findMany({
    where: { tenantId, status: "active" },
    orderBy: { siteName: "asc" },
  }) : [];

  // Get all alerts (open)
  const alerts = tenantId ? await prisma.alert.findMany({
    where: { tenantId, status: "open" },
    orderBy: { createdAt: "desc" },
  }) : [];

  // Calculate stats
  const activeDevices = devices.filter(d => d.status === "active");
  const devicesOnline = activeDevices.length;
  const devicesTotal = devices.length;

  // Generate sample chart data (in production, this would come from telemetry)
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    value: Math.floor(Math.random() * 40) + 60,
    label: `${i}:00`,
  }));

  // Transform chart data for PrimaryTrendCard
  const trendSeries = chartData.map(d => ({ t: d.label, v: d.value }));

  // Sample KPI sparkline data
  const waterSparkline = [65, 70, 68, 72, 75, 73, 78, 80];
  const powerSparkline = [320, 340, 310, 350, 380, 360, 340, 350];

  // Sample events for EventsFeedCard
  const recentEvents = [
    { id: "1", type: "reading" as const, label: "Water level updated", detail: "Tank A: 78%", severity: "neutral" as const, timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: "2", type: "alert" as const, label: "High power consumption", detail: "Peak load detected", severity: "warn" as const, timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: "3", type: "system" as const, label: "Device reconnected", detail: "FrostLink Coldroom", severity: "neutral" as const, timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: "4", type: "reading" as const, label: "Temperature reading", detail: "Coldroom: -18°C", severity: "neutral" as const, timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
  ];

  // Calculate connectivity status
  const weakSignalDevices = devices.filter(d => d.status === "active").length; // Placeholder
  const connectivityStatus = weakSignalDevices === 0 ? "ok" : weakSignalDevices < 2 ? "warn" : "critical";

  // Calculate refill risk (placeholder logic)
  const refillRisk = Math.floor(Math.random() * 40) + 20;

  // AI Insights (in production, these would come from analysis)
  const aiInsights = [
    {
      id: "1",
      type: "optimization" as const,
      title: "Energy Usage Pattern Detected",
      description: "Your power consumption peaks between 6-8 PM. Consider scheduling high-power appliances during off-peak hours to reduce costs.",
      link: "/portal/reports",
      linkText: "View energy report",
      priority: "medium" as const,
    },
    {
      id: "2",
      type: "prediction" as const,
      title: "Water Tank Refill Predicted",
      description: "Based on current usage patterns, your water tank will need refilling in approximately 3 days.",
      link: "/portal/devices",
      linkText: "Check water levels",
      priority: "low" as const,
    },
  ];

  // Format alerts for AlertsPanel
  const formattedAlerts = alerts.slice(0, 5).map(alert => ({
    id: alert.id.toString(),
    title: alert.title,
    severity: alert.severity as "info" | "warning" | "critical",
    createdAt: alert.createdAt,
    deviceName: undefined,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Top Strip: SystemHealthBar + AIInsightsWidget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <SystemHealthBar
            devicesOnline={devicesOnline}
            devicesTotal={devicesTotal}
            alertsOpen={alerts.length}
            lastSync={new Date()}
          />
        </div>
        <div className="lg:col-span-5">
          <AIInsightsWidget insights={aiInsights} />
        </div>
      </div>

      {/* Welcome + Stats Row */}
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {session.user.name || "User"}
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s an overview of your IoT devices</p>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Water Used This Month"
            value="12.4 m³"
            subtitle="+8% vs last month"
            status="neutral"
            icon="water"
            sparkline={waterSparkline}
            href="/portal/reports?type=water"
          />
          <KpiCard
            title="Power Used This Month"
            value="350 kWh"
            subtitle="-5% vs last month"
            status="ok"
            icon="power"
            sparkline={powerSparkline}
            href="/portal/reports?type=power"
          />
          <KpiCard
            title="Devices Online"
            value={`${devicesOnline}/${devicesTotal}`}
            subtitle={devicesOnline === devicesTotal ? "All online" : `${devicesTotal - devicesOnline} offline`}
            status={devicesOnline === devicesTotal ? "ok" : "warn"}
            icon="devices"
            href="/portal/devices"
          />
          <KpiCard
            title="Alerts This Week"
            value={alerts.length.toString()}
            subtitle={alerts.filter(a => a.severity === "critical").length > 0 ? `${alerts.filter(a => a.severity === "critical").length} critical` : "No critical"}
            status={alerts.filter(a => a.severity === "critical").length > 0 ? "critical" : alerts.length > 0 ? "warn" : "ok"}
            icon="alerts"
            href="/portal/alerts"
          />
        </div>
      </div>

      {/* Main Content: Devices Grid + Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Devices Grid - 8 cols */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Devices</h2>
            <Link href="/">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Device
              </Button>
            </Link>
          </div>

          {devices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {devices.slice(0, 6).map((device) => (
                <DeviceCard
                  key={device.id.toString()}
                  id={device.id.toString()}
                  name={device.nickname || device.subscription?.product?.name || `Device ${device.id}`}
                  category={device.inventory?.deviceType?.category || "other"}
                  status={device.status as "active" | "inactive" | "suspended"}
                  serialNumber={device.inventory?.serialNumber || undefined}
                  lastSeenAt={device.lastSeenAt}
                />
              ))}
            </div>
          ) : subscriptions.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <Activity className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Subscriptions Active - Devices Pending</p>
                  <p className="text-sm text-gray-500">Your devices are being prepared for installation</p>
                </div>
              </div>
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div key={sub.id.toString()} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{sub.product?.name}</p>
                      <p className="text-sm text-gray-500">
                        {sub.currency} {Number(sub.monthlyFee).toFixed(2)}/month
                      </p>
                    </div>
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Cpu}
              title="No devices yet"
              description="Get started by adding your first IoT device to monitor your water, power, or temperature."
              action={{ label: "Browse Products", href: "/" }}
            />
          )}

          {devices.length > 6 && (
            <div className="mt-4 text-center">
              <Link href="/portal/devices">
                <Button variant="outline" className="text-gray-600">
                  View all {devices.length} devices
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Alerts Panel - 4 cols */}
        <div className="lg:col-span-4">
          <AlertsPanel alerts={formattedAlerts} maxItems={5} />
        </div>
      </div>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Pending Orders - Awaiting Payment</h3>
          </div>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div key={order.id.toString()} className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-100">
                <div>
                  <p className="font-medium text-gray-900">{order.orderRef}</p>
                  <p className="text-sm text-gray-500">
                    {order.items.map(item => item.product.name).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{order.currency} {Number(order.total).toFixed(2)}</p>
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 mt-1">
                    Pending
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-amber-700 mt-3">
            Complete your payment to activate your subscription and devices.
          </p>
        </div>
      )}

      {/* Main Row: Primary Trend + Health Gauge + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Primary Trend Card - 8 cols */}
        <div className="lg:col-span-8">
          <PrimaryTrendCard
            title="Tank Level Trend"
            range="7d"
            series={trendSeries}
            unit="%"
            thresholds={{ low: 30, critical: 15 }}
            summaryChips={[
              { label: "Avg", value: "68%", tone: "neutral" },
              { label: "Min", value: "45%", tone: "warn" },
              { label: "Max", value: "92%", tone: "good" },
            ]}
            aiMarkers={[
              { t: "14:00", label: "Unusual drop detected", severity: "warn" },
            ]}
          />
        </div>

        {/* Right Column: Health Gauge + Alerts Summary - 4 cols */}
        <div className="lg:col-span-4 space-y-4">
          <HealthGaugeCard
            title="Refill Risk"
            value={refillRisk}
            caption="Based on current usage patterns"
            deltaText={refillRisk > 50 ? "34% higher than last week" : "12% lower than last week"}
            status={refillRisk > 70 ? "critical" : refillRisk > 40 ? "warn" : "ok"}
          />
          <AlertsPanel alerts={formattedAlerts} maxItems={3} />
        </div>
      </div>

      {/* Bottom Row: CTA + Events Feed + Connectivity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CTA Panel */}
        <CtaPanelCard
          title="Connect a New Device"
          description="Add more IoT devices to expand your monitoring capabilities."
          primaryAction={{ label: "Add Device", href: "/" }}
          secondaryAction={{ label: "View Catalog", href: "/" }}
          illustration="device"
        />

        {/* Events Feed */}
        <EventsFeedCard items={recentEvents} />

        {/* Connectivity Card */}
        <ConnectivityCard
          title="Connectivity Check"
          message={weakSignalDevices === 0 ? "All devices have strong signal" : `${weakSignalDevices} device(s) may have weak signal`}
          action={{ label: "View Details", href: "/portal/devices" }}
          status={connectivityStatus as "ok" | "warn" | "critical"}
        />
      </div>
    </div>
  );
}
