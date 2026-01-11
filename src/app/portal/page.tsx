import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { 
  Droplets, Zap, Thermometer, Cpu,
  ChevronRight, TrendingUp, 
  CheckCircle2, Wifi, AlertTriangle, Activity, Bell
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

  // Get tenant's sites
  const sites = tenantId ? await prisma.tenantSite.findMany({
    where: { tenantId, status: "active" },
    orderBy: { siteName: "asc" },
  }) : [];

  // Get all alerts (open)
  const alerts = tenantId ? await prisma.alert.findMany({
    where: { tenantId, status: "open" },
    orderBy: { createdAt: "desc" },
    take: 5,
  }) : [];

  // Calculate stats
  const activeDevices = devices.filter(d => d.status === "active");
  const devicesOnline = activeDevices.length;
  const devicesTotal = devices.length;

  // Weekly activity data (simulated)
  const weeklyActivity = [
    { day: "Sun", value: 25 },
    { day: "Mon", value: 55 },
    { day: "Tue", value: 40 },
    { day: "Wed", value: 70 },
    { day: "Thu", value: 60 },
    { day: "Fri", value: 85 },
    { day: "Sat", value: 45 },
  ];

  // Daily tasks for portal
  const dailyTasks = [
    { id: 1, title: "Water Monitoring", count: devices.filter(d => d.inventory?.deviceType?.category === "water").length, icon: "water", color: "blue" },
    { id: 2, title: "Power Monitoring", count: devices.filter(d => d.inventory?.deviceType?.category === "power").length, icon: "power", color: "yellow" },
    { id: 3, title: "Temperature Control", count: devices.filter(d => d.inventory?.deviceType?.category === "environment").length, icon: "temp", color: "red" },
    { id: 4, title: "Active Sites", count: sites.length, icon: "sites", color: "green" },
  ];


  // Category icons mapping
  const categoryIcons: Record<string, React.ReactNode> = {
    water: <Droplets className="h-5 w-5 text-blue-500" />,
    power: <Zap className="h-5 w-5 text-yellow-500" />,
    environment: <Thermometer className="h-5 w-5 text-red-500" />,
  };

  return (
    <main className="p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Main Content */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Devices Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Devices</h2>
              <Link href="/" className="text-purple-600 text-sm font-medium hover:text-purple-700">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {devices.length > 0 ? devices.slice(0, 3).map((device) => (
                <Link 
                  key={device.id.toString()} 
                  href={`/portal/devices/${device.id}`}
                  className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 bg-purple-50 rounded-xl">
                      {categoryIcons[device.inventory?.deviceType?.category || ""] || <Cpu className="h-5 w-5 text-purple-500" />}
                    </div>
                    <Badge 
                      className={`text-xs ${
                        device.status === "active" 
                          ? "bg-green-100 text-green-700 border-0" 
                          : "bg-gray-100 text-gray-600 border-0"
                      }`}
                    >
                      {device.status === "active" ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {device.nickname || device.subscription?.product?.name || `Device ${device.id}`}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {device.inventory?.deviceType?.category || "IoT Device"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Wifi className={`h-4 w-4 ${device.status === "active" ? "text-green-500" : "text-gray-400"}`} />
                      <span className="text-xs text-gray-500">
                        {device.status === "active" ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {device.inventory?.serialNumber?.slice(-6) || "N/A"}
                    </span>
                  </div>
                </Link>
              )) : subscriptions.length > 0 ? (
                <div className="col-span-3 bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-amber-50 rounded-xl">
                      <Activity className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Devices Pending Setup</p>
                      <p className="text-sm text-gray-500">Your devices are being prepared</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {subscriptions.slice(0, 3).map((sub) => (
                      <div key={sub.id.toString()} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm font-medium text-gray-900">{sub.product?.name}</span>
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Pending</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="col-span-3 bg-white rounded-2xl p-8 border border-gray-100 text-center">
                  <Cpu className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No devices yet</p>
                  <Link 
                    href="/"
                    className="inline-block px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Activity & Overview Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Usage Activity Chart */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Usage Activity</h3>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +12% from last week
                  </p>
                </div>
                <select className="text-sm text-gray-500 bg-gray-50 border-0 rounded-lg px-2 py-1">
                  <option>weekly</option>
                  <option>monthly</option>
                </select>
              </div>
              <div className="space-y-3">
                {weeklyActivity.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-8">{item.day}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Overview */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Device Overview</h3>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {dailyTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.color === "blue" ? "bg-blue-500" :
                        task.color === "yellow" ? "bg-yellow-500" :
                        task.color === "red" ? "bg-red-500" :
                        "bg-green-500"
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.count} device(s)</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Active Subscriptions</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {subscriptions.length} Active
                </Badge>
                <Link href="/portal/subscriptions" className="p-1 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {subscriptions.length > 0 ? subscriptions.slice(0, 4).map((sub) => (
                <div 
                  key={sub.id.toString()}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-100">
                      {categoryIcons[sub.product?.category || ""] || <Zap className="h-5 w-5 text-purple-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sub.product?.name}</p>
                      <p className="text-xs text-gray-500">
                        Since {new Date(sub.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Monthly</p>
                    <p className="font-semibold text-gray-900">{sub.currency} {Number(sub.monthlyFee).toFixed(0)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full w-full" />
                    </div>
                    <span className="text-sm font-medium text-green-600">Active</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p>No active subscriptions</p>
                  <Link 
                    href="/"
                    className="inline-block mt-3 text-purple-600 text-sm font-medium hover:text-purple-700"
                  >
                    Browse Products →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-900">System Status</span>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {devicesOnline}/{devicesTotal} Devices Online
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {alerts.length > 0 
                ? `${alerts.length} alert(s) require attention`
                : "All systems operating normally"
              }
            </p>
            <Link 
              href="/portal/devices"
              className="block w-full py-2.5 bg-purple-600 text-white text-center rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              View Devices
            </Link>
          </div>

          {/* Calendar */}
          <CalendarWidget />

          {/* Alerts */}
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
                      {new Date(alert.createdAt).toLocaleDateString()}
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
        </div>
      </div>
    </main>
  );
}
