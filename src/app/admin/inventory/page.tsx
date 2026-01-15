import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import InventoryList from "./InventoryList";

export default async function InventoryPage() {
  const inventory = await prisma.deviceInventory.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedInventory = inventory.map((item) => ({
    id: item.id.toString(),
    serialNumber: item.serialNumber,
    imei: item.imei,
    firmwareVersion: item.firmwareVersion,
    status: item.status,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Manage device units and stock</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/inventory/import">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
          </Link>
          <Link href="/admin/inventory/new">
            <Button className="bg-[#f74780] hover:bg-[#e03a6f] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </Link>
        </div>
      </div>

      <InventoryList inventory={serializedInventory} />
    </main>
  );
}
