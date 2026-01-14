import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Cpu, ChevronRight, Wifi, WifiOff, Upload, Download,
  Filter, Search, AlertTriangle, CheckCircle2
} from "lucide-react";

export default async function AdminDevicesPage() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    redirect("/login?type=admin");
  }

  const [devices, deviceStats] = await Promise.all([
    prisma.tenantDevice.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        inventory: { include: { deviceType: true } },
        subscription: { include: { product: true } },
      },
    }),
    prisma.tenantDevice.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const statusCounts = {
    active: deviceStats.find(s => s.status === "active")?._count.id || 0,
    inactive: deviceStats.find(s => s.status === "inactive")?._count.id || 0,
    suspended: deviceStats.find(s => s.status === "suspended")?._count.id || 0,
  };

  const totalDevices = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  // Calculate health scores
  const now = new Date();
  const devicesWithHealth = devices.map(device => {
    let healthScore = 100;
    
    // Reduce score if inactive
    if (device.status !== "active") healthScore -= 30;
    
    // Reduce score if not seen recently
    if (device.lastSeenAt) {
      const hoursSinceLastSeen = (now.getTime() - device.lastSeenAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSeen > 24) healthScore -= 20;
      if (hoursSinceLastSeen > 72) healthScore -= 20;
      if (hoursSinceLastSeen > 168) healthScore -= 20;
    } else {
      healthScore -= 40;
    }

    return { ...device, healthScore: Math.max(0, healthScore) };
  });

  return (
    <main className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Device Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage all deployed devices</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/devices/import">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Bulk Import
            </Button>
          </Link>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Cpu className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalDevices}</p>
              <p className="text-sm text-gray-500">Total Devices</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Wifi className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.active}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <WifiOff className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.inactive}</p>
              <p className="text-sm text-gray-500">Inactive</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.suspended}</p>
              <p className="text-sm text-gray-500">Suspended</p>
            </div>
          </div>
        </div>
      </div>

      {/* Devices List */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Devices</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search devices..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {devicesWithHealth.length > 0 ? devicesWithHealth.map((device) => (
            <div
              key={device.id.toString()}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    device.status === "active" ? "bg-green-50" : 
                    device.status === "inactive" ? "bg-red-50" : "bg-yellow-50"
                  }`}>
                    {device.status === "active" ? (
                      <Wifi className="h-5 w-5 text-green-600" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {device.nickname || device.subscription?.product?.name || `Device ${device.id}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {device.inventory?.serialNumber} • {device.inventory?.deviceType?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Health Score */}
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      device.healthScore >= 80 ? "text-green-600" :
                      device.healthScore >= 50 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {device.healthScore}%
                    </div>
                    <p className="text-xs text-gray-500">Health</p>
                  </div>

                  {/* Last Seen */}
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-900">
                      {device.lastSeenAt 
                        ? new Date(device.lastSeenAt).toLocaleDateString()
                        : "Never"
                      }
                    </p>
                    <p className="text-xs text-gray-500">Last seen</p>
                  </div>

                  <Badge variant="outline" className={
                    device.status === "active" ? "bg-green-50 text-green-700 border-green-200" :
                    device.status === "inactive" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }>
                    {device.status}
                  </Badge>

                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center">
              <Cpu className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No devices found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
