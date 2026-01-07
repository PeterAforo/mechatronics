import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Cpu, Plus, Wifi, WifiOff, ChevronRight,
  Droplets, Zap, Thermometer, Factory
} from "lucide-react";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  water: Droplets,
  power: Zap,
  environment: Thermometer,
  industrial: Factory,
  other: Cpu,
};

export default async function DevicesPage() {
  const session = await auth();
  
  if (!session?.user || session.user.userType !== "tenant") {
    redirect("/login");
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;

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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Devices</h1>
          <p className="text-gray-500">Manage your IoT devices</p>
        </div>
        <Link href="/products">
          <Button className="bg-[#f74780] hover:bg-[#e03a6f]">
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </Link>
      </div>

      {devices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Cpu className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No devices yet</h3>
          <p className="text-gray-500 mb-4">Get started by ordering your first IoT device</p>
          <Link href="/products">
            <Button className="bg-[#f74780] hover:bg-[#e03a6f]">
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Device</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Last Seen</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {devices.map((device) => {
                const category = device.inventory?.deviceType?.category || "other";
                const Icon = categoryIcons[category] || Cpu;
                const isOnline = device.lastSeenAt && 
                  (new Date().getTime() - new Date(device.lastSeenAt).getTime()) < 5 * 60 * 1000;

                return (
                  <tr key={device.id.toString()} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {device.nickname || device.subscription?.product?.name || "Device"}
                          </p>
                          <p className="text-sm text-gray-500">{device.inventory?.serialNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{device.inventory?.deviceType?.name || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isOnline ? (
                          <Badge className="bg-green-100 text-green-700 border-0">
                            <Wifi className="h-3 w-3 mr-1" />
                            Online
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            <WifiOff className="h-3 w-3 mr-1" />
                            Offline
                          </Badge>
                        )}
                        <Badge 
                          variant="outline"
                          className={device.status === "active" 
                            ? "border-green-200 bg-green-50 text-green-700" 
                            : "border-gray-200 text-gray-600"
                          }
                        >
                          {device.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {device.lastSeenAt 
                        ? new Date(device.lastSeenAt).toLocaleString()
                        : "Never"
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/portal/devices/${device.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
