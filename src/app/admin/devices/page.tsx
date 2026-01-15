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

  const totalDevices = devices.length;

  // Calculate connectivity status based on telemetry activity
  // Online = data received within last 3 hours
  // Offline = no data in >3 hours or never connected
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  
  const devicesWithHealth = devices.map(device => {
    let healthScore = 100;
    let connectivityStatus: "online" | "offline" | "never_connected";
    let hoursSinceLastSeen: number | null = null;
    
    if (!device.lastSeenAt) {
      connectivityStatus = "never_connected";
      healthScore = 20;
    } else {
      hoursSinceLastSeen = (now.getTime() - device.lastSeenAt.getTime()) / (1000 * 60 * 60);
      
      if (device.lastSeenAt >= threeHoursAgo) {
        connectivityStatus = "online";
        healthScore = 100;
      } else {
        connectivityStatus = "offline";
        // Reduce health based on how long offline
        if (hoursSinceLastSeen > 3) healthScore = 70;
        if (hoursSinceLastSeen > 24) healthScore = 50;
        if (hoursSinceLastSeen > 72) healthScore = 30;
        if (hoursSinceLastSeen > 168) healthScore = 10;
      }
    }
    
    // Further reduce if subscription status is not active
    if (device.status !== "active") healthScore = Math.max(0, healthScore - 20);

    return { 
      ...device, 
      healthScore: Math.max(0, healthScore),
      connectivityStatus,
      hoursSinceLastSeen,
    };
  });

  // Count by connectivity status (based on telemetry, not subscription status)
  const connectivityCounts = {
    online: devicesWithHealth.filter(d => d.connectivityStatus === "online").length,
    offline: devicesWithHealth.filter(d => d.connectivityStatus === "offline").length,
    neverConnected: devicesWithHealth.filter(d => d.connectivityStatus === "never_connected").length,
  };

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

      {/* Stats Cards - Based on Telemetry Activity */}
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
              <p className="text-2xl font-bold text-gray-900">{connectivityCounts.online}</p>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <WifiOff className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{connectivityCounts.offline}</p>
              <p className="text-sm text-gray-500">Offline (&gt;3hrs)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{connectivityCounts.neverConnected}</p>
              <p className="text-sm text-gray-500">Never Connected</p>
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
            <Link
              key={device.id.toString()}
              href={`/admin/devices/${device.id}`}
              className="block p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    device.connectivityStatus === "online" ? "bg-green-50" : 
                    device.connectivityStatus === "offline" ? "bg-red-50" : "bg-yellow-50"
                  }`}>
                    {device.connectivityStatus === "online" ? (
                      <Wifi className="h-5 w-5 text-green-600" />
                    ) : device.connectivityStatus === "offline" ? (
                      <WifiOff className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
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
                        ? device.hoursSinceLastSeen !== null && device.hoursSinceLastSeen < 1
                          ? "Just now"
                          : device.hoursSinceLastSeen !== null && device.hoursSinceLastSeen < 24
                          ? `${device.hoursSinceLastSeen.toFixed(1)}h ago`
                          : new Date(device.lastSeenAt).toLocaleDateString()
                        : "Never"
                      }
                    </p>
                    <p className="text-xs text-gray-500">Last data</p>
                  </div>

                  {/* Connectivity Status Badge */}
                  <Badge variant="outline" className={
                    device.connectivityStatus === "online" ? "bg-green-50 text-green-700 border-green-200" :
                    device.connectivityStatus === "offline" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }>
                    {device.connectivityStatus === "online" ? "Online" :
                     device.connectivityStatus === "offline" ? "Offline" : "No Data"}
                  </Badge>

                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Link>
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
