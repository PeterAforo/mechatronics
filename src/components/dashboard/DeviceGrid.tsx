"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { DeviceCard } from "./DeviceCard";
import { Search, Filter } from "lucide-react";
import type { DeviceGridProps, Device } from "@/types/dashboard";

export function DeviceGrid({
  devices,
  filter,
  sort = "severity",
}: DeviceGridProps) {
  const [searchQuery, setSearchQuery] = useState(filter?.query || "");
  const [statusFilter, setStatusFilter] = useState(filter?.status || "");
  const [typeFilter, setTypeFilter] = useState(filter?.type || "");

  const filteredDevices = useMemo(() => {
    let result = [...devices];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.location?.toLowerCase().includes(query) ||
          d.id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter((d) => d.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter) {
      result = result.filter((d) => d.type === typeFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sort === "severity") {
        const severityOrder = { critical: 0, warn: 1, offline: 2, ok: 3 };
        return (severityOrder[a.status] || 4) - (severityOrder[b.status] || 4);
      }
      if (sort === "lastUpdated") {
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [devices, searchQuery, statusFilter, typeFilter, sort]);

  const statusCounts = useMemo(() => {
    return devices.reduce(
      (acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [devices]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          {["all", "ok", "warn", "critical", "offline"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === "all" ? "" : status)}
              className={cn(
                "px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors",
                (status === "all" && !statusFilter) || statusFilter === status
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== "all" && statusCounts[status] ? (
                <span className="ml-1 text-gray-400">({statusCounts[status]})</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-500">No devices found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-700"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
