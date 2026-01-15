"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Boxes, ChevronRight, Plus } from "lucide-react";
import BulkDeleteTable from "@/components/admin/BulkDeleteTable";

interface InventoryItem {
  id: string;
  serialNumber: string;
  imei: string | null;
  firmwareVersion: string | null;
  status: string;
}

interface InventoryListProps {
  inventory: InventoryItem[];
}

const statusColors: Record<string, string> = {
  in_stock: "border-green-200 bg-green-50 text-green-700",
  allocated: "border-blue-200 bg-blue-50 text-blue-700",
  deployed: "border-purple-200 bg-purple-50 text-purple-700",
  maintenance: "border-yellow-200 bg-yellow-50 text-yellow-700",
  retired: "border-gray-200 bg-gray-50 text-gray-600",
};

export default function InventoryList({ inventory }: InventoryListProps) {
  return (
    <BulkDeleteTable
      items={inventory}
      deleteEndpoint="/api/admin/inventory/bulk-delete"
      itemName="device"
      itemNamePlural="devices"
      emptyState={
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
      }
      renderItem={(item, isSelected, onToggle) => (
        <div className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${item.serialNumber}`}
          />
          <Link
            href={`/admin/inventory/${item.id}`}
            className="flex-1 flex items-center justify-between"
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
        </div>
      )}
    />
  );
}
