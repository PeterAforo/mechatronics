import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DeviceTypesList from "./DeviceTypesList";

export default async function DeviceTypesPage() {
  const deviceTypes = await prisma.deviceType.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedDeviceTypes = deviceTypes.map((t) => ({
    id: t.id.toString(),
    name: t.name,
    typeCode: t.typeCode,
    category: t.category,
    isActive: t.isActive,
  }));

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

      <DeviceTypesList deviceTypes={serializedDeviceTypes} />
    </main>
  );
}
