import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronRight, Boxes } from "lucide-react";

export default async function InventoryPage() {
  const inventory = await prisma.deviceInventory.findMany({
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    in_stock: "border-green-200 bg-green-50 text-green-700",
    allocated: "border-blue-200 bg-blue-50 text-blue-700",
    deployed: "border-purple-200 bg-purple-50 text-purple-700",
    maintenance: "border-yellow-200 bg-yellow-50 text-yellow-700",
    retired: "border-gray-200 bg-gray-50 text-gray-600",
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Manage device units and stock</p>
        </div>
        <Link href="/admin/inventory/new">
          <Button className="bg-[#f74780] hover:bg-[#e03a6f] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </Link>
      </div>

      {inventory.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {inventory.map((item) => (
            <Link
              key={item.id.toString()}
              href={`/admin/inventory/${item.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-green-50 rounded-lg">
                  <Boxes className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.serialNumber}</p>
                  <p className="text-sm text-gray-500">
                    {item.imei || "No IMEI"} • {item.firmwareVersion || "Unknown firmware"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className={statusColors[item.status] || statusColors.in_stock}>
                  {item.status.replace("_", " ")}
                </Badge>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-4">
            <Boxes className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No inventory yet</h3>
          <p className="text-gray-500 mb-4">Add your first device to the inventory</p>
          <Link href="/admin/inventory/new">
            <Button className="bg-[#f74780] hover:bg-[#e03a6f] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
