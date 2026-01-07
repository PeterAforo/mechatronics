"use client";

import Link from "next/link";
import { Bell, AlertTriangle, Info, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Alert {
  id: string;
  title: string;
  severity: "info" | "warning" | "critical";
  createdAt: Date;
  deviceName?: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
  className?: string;
  maxItems?: number;
}

const severityConfig = {
  info: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-l-blue-400",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-l-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  critical: {
    icon: Bell,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-l-red-400",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function AlertsPanel({ alerts, className, maxItems = 5 }: AlertsPanelProps) {
  const displayAlerts = alerts.slice(0, maxItems);
  const hasMore = alerts.length > maxItems;

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden",
        "transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Open Alerts</h3>
          {alerts.length > 0 && (
            <Badge variant="secondary" className="text-xs bg-red-50 text-red-700 border-red-200">
              {alerts.length}
            </Badge>
          )}
        </div>
        <Link
          href="/portal/alerts"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 transition-colors"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Content */}
      {displayAlerts.length > 0 ? (
        <div className="divide-y divide-gray-50">
          {displayAlerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;

            return (
              <Link
                key={alert.id}
                href={`/portal/alerts?id=${alert.id}`}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 border-l-3 hover:bg-gray-50/50 transition-colors",
                  config.border
                )}
              >
                <div className={cn("p-1.5 rounded-lg shrink-0", config.bg)}>
                  <Icon className={cn("h-3.5 w-3.5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {alert.deviceName && (
                      <span className="text-xs text-gray-500 truncate">{alert.deviceName}</span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(alert.createdAt)}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-xs shrink-0 capitalize", config.badge)}>
                  {alert.severity}
                </Badge>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mb-3">
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No open alerts</p>
          <p className="text-xs text-gray-400 mt-1">All systems running smoothly</p>
        </div>
      )}

      {/* Footer */}
      {hasMore && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
          <Link
            href="/portal/alerts"
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            +{alerts.length - maxItems} more alerts
          </Link>
        </div>
      )}
    </div>
  );
}
