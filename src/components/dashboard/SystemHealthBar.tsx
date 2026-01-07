"use client";

import { useState, useEffect } from "react";
import { Activity, Wifi, Server, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemHealthBarProps {
  devicesOnline: number;
  devicesTotal: number;
  alertsOpen: number;
  lastSync?: Date | null;
  className?: string;
}

export function SystemHealthBar({
  devicesOnline,
  devicesTotal,
  alertsOpen,
  lastSync,
  className,
}: SystemHealthBarProps) {
  const [formattedTime, setFormattedTime] = useState<string | null>(null);

  // Format time on client-side only to avoid hydration mismatch
  useEffect(() => {
    if (lastSync) {
      const hours = new Date(lastSync).getHours();
      const minutes = new Date(lastSync).getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const hour12 = hours % 12 || 12;
      setFormattedTime(`${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`);
    }
  }, [lastSync]);

  const healthPercent = devicesTotal > 0 ? (devicesOnline / devicesTotal) * 100 : 100;
  const healthStatus = healthPercent >= 90 ? "healthy" : healthPercent >= 70 ? "warning" : "critical";

  const statusConfig = {
    healthy: {
      color: "text-emerald-600",
      bg: "bg-emerald-500",
      bgLight: "bg-emerald-50",
      label: "All Systems Operational",
    },
    warning: {
      color: "text-amber-600",
      bg: "bg-amber-500",
      bgLight: "bg-amber-50",
      label: "Some Devices Offline",
    },
    critical: {
      color: "text-red-600",
      bg: "bg-red-500",
      bgLight: "bg-red-50",
      label: "Multiple Devices Offline",
    },
  };

  const config = statusConfig[healthStatus];

  return (
    <div
      className={cn(
        "flex items-center gap-6 px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm",
        "transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]",
        className
      )}
    >
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className={cn("relative flex items-center justify-center", config.bgLight, "p-1.5 rounded-lg")}>
          <Activity className={cn("h-4 w-4", config.color)} />
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full",
              config.bg,
              healthStatus === "healthy" && "animate-pulse"
            )}
          />
        </div>
        <span className={cn("text-sm font-medium", config.color)}>{config.label}</span>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-200" />

      {/* Devices Online */}
      <div className="flex items-center gap-2">
        <Wifi className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{devicesOnline}</span>
          <span className="text-gray-400">/{devicesTotal}</span> online
        </span>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-200" />

      {/* Open Alerts */}
      <div className="flex items-center gap-2">
        <AlertTriangle
          className={cn("h-4 w-4", alertsOpen > 0 ? "text-amber-500" : "text-gray-400")}
        />
        <span className="text-sm text-gray-600">
          <span className={cn("font-semibold", alertsOpen > 0 ? "text-amber-600" : "text-gray-900")}>
            {alertsOpen}
          </span>{" "}
          open alerts
        </span>
      </div>

      {/* Last Sync */}
      {lastSync && (
        <>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              Last sync:{" "}
              <span className="text-gray-700">
                {formattedTime || "--:--"}
              </span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
