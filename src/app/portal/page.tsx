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
import { TrendChart } from "@/components/dashboard/TrendChart";
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Devices</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">{devicesTotal}</p>
                <p className="text-xs text-emerald-600 mt-1">{devicesOnline} online</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl">
                <Cpu className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">{subscriptions.length}</p>
                <p className="text-xs text-gray-400 mt-1">Active plans</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Open Alerts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">{alerts.length}</p>
                <p className="text-xs text-amber-600 mt-1">{alerts.filter(a => a.severity === "critical").length} critical</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <Bell className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Sites</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">{sites.length}</p>
                <p className="text-xs text-gray-400 mt-1">Locations</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
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

      {/* Analytics Row: Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          title="Power Consumption"
          data={chartData}
          unit=" kWh"
          color="#4f46e5"
          trend={{ value: -5.2, label: "vs last week" }}
        />
        <TrendChart
          title="Water Level"
          data={chartData.map(d => ({ ...d, value: Math.floor(Math.random() * 30) + 50 }))}
          unit="%"
          color="#0891b2"
          trend={{ value: 2.1, label: "vs last week" }}
        />
      </div>
    </div>
  );
}
