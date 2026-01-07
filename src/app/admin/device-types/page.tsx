import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronRight, Factory } from "lucide-react";

export default async function DeviceTypesPage() {
  const deviceTypes = await prisma.deviceType.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Device Types</h1>
          <p className="text-gray-500 mt-1">Manage device models and configurations</p>
        </div>
        <Link href="/admin/device-types/new">
          <Button className="bg-[#f74780] hover:bg-[#e03a6f] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Device Type
          </Button>
        </Link>
      </div>

      {deviceTypes.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {deviceTypes.map((type) => (
            <Link
              key={type.id.toString()}
              href={`/admin/device-types/${type.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-purple-50 rounded-lg">
                  <Factory className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{type.name}</p>
                  <p className="text-sm text-gray-500">
                    {type.typeCode} • {type.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className={
                    type.isActive
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-gray-200 bg-gray-50 text-gray-600"
                  }
                >
                  {type.isActive ? "active" : "inactive"}
                </Badge>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-4">
            <Factory className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No device types yet</h3>
          <p className="text-gray-500 mb-4">Create your first device type to get started</p>
          <Link href="/admin/device-types/new">
            <Button className="bg-[#f74780] hover:bg-[#e03a6f] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Device Type
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
