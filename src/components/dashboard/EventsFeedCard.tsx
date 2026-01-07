"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, Radio, Server } from "lucide-react";
import type { EventsFeedCardProps, EventFilter, EventItem } from "@/types/dashboard";

const filterOptions: { label: string; value: EventFilter }[] = [
  { label: "All", value: "all" },
  { label: "Alerts", value: "alerts" },
  { label: "Readings", value: "readings" },
  { label: "Offline", value: "offline" },
];

const eventTypeIcons = {
  reading: Activity,
  alert: AlertTriangle,
  system: Server,
  ingestion: Radio,
};

const severityColors = {
  neutral: "text-gray-500",
  warn: "text-amber-500",
  critical: "text-red-500",
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return then.toLocaleDateString();
}

export function EventsFeedCard({
  items,
  filter = "all",
  onFilterChange,
}: EventsFeedCardProps) {
  const [activeFilter, setActiveFilter] = useState<EventFilter>(filter);

  const handleFilterChange = (f: EventFilter) => {
    setActiveFilter(f);
    onFilterChange?.(f);
  };

  const filteredItems = items.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "alerts") return item.type === "alert";
    if (activeFilter === "readings") return item.type === "reading";
    if (activeFilter === "offline") return item.severity === "critical";
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Recent Events</h3>
        <div className="flex items-center gap-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-md transition-colors",
                activeFilter === opt.value
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filteredItems.slice(0, 8).map((event) => {
              const Icon = eventTypeIcons[event.type] || Activity;
              const content = (
                <div
                  key={event.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3",
                    event.href && "hover:bg-gray-50 cursor-pointer transition-colors"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg bg-gray-100",
                    event.severity === "critical" && "bg-red-50",
                    event.severity === "warn" && "bg-amber-50"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      severityColors[event.severity || "neutral"]
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.label}
                    </p>
                    {event.detail && (
                      <p className="text-xs text-gray-500 truncate">{event.detail}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatTimeAgo(event.timestamp)}
                  </span>
                </div>
              );

              if (event.href) {
                return (
                  <Link key={event.id} href={event.href}>
                    {content}
                  </Link>
                );
              }
              return <div key={event.id}>{content}</div>;
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-sm text-gray-400">
            No events to display
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 8 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
          <Link
            href="/portal/events"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all {items.length} events →
          </Link>
        </div>
      )}
    </div>
  );
}
