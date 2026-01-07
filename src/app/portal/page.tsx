import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, Zap, Thermometer, Factory, Heart, Shield,
  Plus, Settings, Bell, Building2, MapPin, ChevronRight
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";

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
    where: { tenantId, status: "active" },
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

  // Get recent alerts
  const alerts = tenantId ? await prisma.alert.findMany({
    where: { tenantId, status: "open" },
    orderBy: { createdAt: "desc" },
    take: 5,
  }) : [];

  return (
    <div className="p-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {session.user.name || "User"}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s an overview of your IoT devices</p>
      </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Devices</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{devices.length}</p>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Factory className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Subscriptions</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{subscriptions.length}</p>
              </div>
              <div className="p-2.5 bg-green-50 rounded-lg">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{pendingOrders.length}</p>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sites</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{sites.length}</p>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Devices */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Devices</h2>
            <Link href="/">
              <Button size="sm" className="bg-[#f74780] hover:bg-[#e03a6f] text-white">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Device
              </Button>
            </Link>
          </div>

          {devices.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {devices.map((device) => {
                const Icon = device.inventory?.deviceType?.category 
                  ? categoryIcons[device.inventory.deviceType.category] || Factory
                  : Factory;
                return (
                  <Link 
                    key={device.id.toString()} 
                    href={`/portal/devices/${device.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-gray-100 rounded-lg">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {device.nickname || device.subscription?.product?.name || `Device ${device.id}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {device.inventory?.serialNumber || "No serial"} • {device.inventory?.deviceType?.name || "Unknown type"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={device.status === "active" 
                          ? "border-green-200 bg-green-50 text-green-700" 
                          : "border-gray-200 bg-gray-50 text-gray-600"
                        }
                      >
                        {device.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : subscriptions.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Subscriptions Active - Devices Pending</p>
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
                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-4">
                <Factory className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No devices yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first IoT device</p>
              <Link href="/">
                <Button className="bg-[#f74780] hover:bg-[#e03a6f] text-white">
                  Browse Products
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Orders</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 font-medium mb-3">Awaiting Payment Confirmation</p>
              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <div key={order.id.toString()} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderRef}</p>
                      <p className="text-sm text-gray-500">
                        {order.items.map(item => item.product.name).join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.currency} {Number(order.total).toFixed(2)}</p>
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                        Pending
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-amber-700 mt-3">
                Please complete your payment. Your subscription will be activated once payment is confirmed.
              </p>
            </div>
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
              <Link href="/portal/alerts">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {alerts.map((alert: { id: bigint; title: string; severity: string; createdAt: Date }) => (
                <div key={alert.id.toString()} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      alert.severity === "critical" ? "bg-red-50" :
                      alert.severity === "warning" ? "bg-yellow-50" : "bg-blue-50"
                    }`}>
                      <Bell className={`h-4 w-4 ${
                        alert.severity === "critical" ? "text-red-600" :
                        alert.severity === "warning" ? "text-yellow-600" : "text-blue-600"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      alert.severity === "critical" ? "border-red-200 bg-red-50 text-red-700" :
                      alert.severity === "warning" ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
                      "border-blue-200 bg-blue-50 text-blue-700"
                    }
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
