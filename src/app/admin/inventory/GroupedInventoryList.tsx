"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Boxes, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

interface InventoryItem {
  id: string;
  serialNumber: string;
  imei: string | null;
  firmwareVersion: string | null;
  status: string;
}

interface InventoryGroup {
  deviceTypeName: string;
  deviceTypeId: string;
  items: InventoryItem[];
}

interface GroupedInventoryListProps {
  groups: InventoryGroup[];
}

const statusColors: Record<string, string> = {
  in_stock: "border-green-200 bg-green-50 text-green-700",
  sold: "border-blue-200 bg-blue-50 text-blue-700",
  installed: "border-purple-200 bg-purple-50 text-purple-700",
  returned: "border-yellow-200 bg-yellow-50 text-yellow-700",
  retired: "border-gray-200 bg-gray-50 text-gray-600",
};

export default function GroupedInventoryList({ groups }: GroupedInventoryListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groups.map((g) => g.deviceTypeId)) // All expanded by default
  );
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleGroup = (deviceTypeId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deviceTypeId)) {
        newSet.delete(deviceTypeId);
      } else {
        newSet.add(deviceTypeId);
      }
      return newSet;
    });
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);

  if (totalItems === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900">All Inventory Items</h2>
      
      {groups.map((group) => {
        const isExpanded = expandedGroups.has(group.deviceTypeId);
        const groupItemIds = group.items.map((item) => item.id);
        const allSelected = groupItemIds.every((id) => selectedItems.has(id));
        const someSelected = groupItemIds.some((id) => selectedItems.has(id));

        const toggleGroupSelection = () => {
          setSelectedItems((prev) => {
            const newSet = new Set(prev);
            if (allSelected) {
              groupItemIds.forEach((id) => newSet.delete(id));
            } else {
              groupItemIds.forEach((id) => newSet.add(id));
            }
            return newSet;
          });
        };

        return (
          <div key={group.deviceTypeId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.deviceTypeId)}
              className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected && !allSelected;
                    }
                  }}
                  onCheckedChange={toggleGroupSelection}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select all ${group.deviceTypeName}`}
                />
                <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg">
                  <Boxes className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{group.deviceTypeName}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{group.items.length} units</p>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
              />
            </button>

            {/* Group Items */}
            {isExpanded && (
              <div className="border-t border-gray-100 divide-y divide-gray-100">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="pl-2 sm:pl-6">
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${item.serialNumber}`}
                      />
                    </div>
                    <Link
                      href={`/admin/inventory/${item.id}`}
                      className="flex-1 flex items-center justify-between min-w-0"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.serialNumber}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {item.imei || "No IMEI"} • {item.firmwareVersion || "v?"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <Badge variant="outline" className={`text-xs ${statusColors[item.status] || statusColors.in_stock}`}>
                          {item.status.replace("_", " ")}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-gray-400 hidden sm:block" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
