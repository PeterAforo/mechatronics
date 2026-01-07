"use client";

import Link from "next/link";
import { Droplets, Zap, Thermometer, Factory, Heart, Shield, Wifi, WifiOff, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceCardProps {
  id: string;
  name: string;
  category: string;
  status: "active" | "inactive" | "suspended" | "offline";
  serialNumber?: string;
  lastValue?: number;
  unit?: string;
  lastSeenAt?: Date | null;
  className?: string;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  water: Droplets,
  power: Zap,
  environment: Thermometer,
  industrial: Factory,
  healthcare: Heart,
  security: Shield,
  other: Factory,
};

const categoryColors: Record<string, { bg: string; text: string; ring: string }> = {
  water: { bg: "bg-cyan-50", text: "text-cyan-600", ring: "ring-cyan-500/20" },
  power: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-500/20" },
  environment: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-500/20" },
  industrial: { bg: "bg-orange-50", text: "text-orange-600", ring: "ring-orange-500/20" },
  healthcare: { bg: "bg-pink-50", text: "text-pink-600", ring: "ring-pink-500/20" },
  security: { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-500/20" },
  other: { bg: "bg-gray-50", text: "text-gray-600", ring: "ring-gray-500/20" },
};

const statusConfig = {
  active: {
    label: "Online",
    color: "text-emerald-600",
    bg: "bg-emerald-500",
    ring: "ring-emerald-500/30",
  },
  inactive: {
    label: "Inactive",
    color: "text-gray-500",
    bg: "bg-gray-400",
    ring: "ring-gray-400/30",
  },
  suspended: {
    label: "Suspended",
    color: "text-amber-600",
    bg: "bg-amber-500",
    ring: "ring-amber-500/30",
  },
  offline: {
    label: "Offline",
    color: "text-red-600",
    bg: "bg-red-500",
    ring: "ring-red-500/30",
  },
};

function formatLastSeen(date: Date | null | undefined): string {
  if (!date) return "Never";
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(date).toLocaleDateString();
}

export function DeviceCard({
  id,
  name,
  category,
  status,
  serialNumber,
  lastValue,
  unit,
  lastSeenAt,
  className,
}: DeviceCardProps) {
  const Icon = categoryIcons[category] || Factory;
  const colors = categoryColors[category] || categoryColors.other;
  const statusCfg = statusConfig[status] || statusConfig.inactive;
  const isOnline = status === "active";

  return (
    <Link
      href={`/portal/devices/${id}`}
      className={cn(
        "group relative block bg-white rounded-xl border border-gray-100 p-4 shadow-sm",
        "hover:shadow-md hover:border-gray-200 transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]",
        !isOnline && "opacity-75",
        className
      )}
    >
      {/* Status Ring - Pulses when actively receiving data */}
      <div
        className={cn(
          "absolute top-3 right-3 h-2.5 w-2.5 rounded-full ring-4",
          statusCfg.bg,
          statusCfg.ring,
          isOnline && "animate-pulse"
        )}
      />

      {/* Icon */}
      <div className={cn("inline-flex p-2.5 rounded-xl mb-3", colors.bg, colors.ring, "ring-1")}>
        <Icon className={cn("h-5 w-5", colors.text)} />
      </div>

      {/* Name & Serial */}
      <h3 className="text-sm font-semibold text-gray-900 mb-0.5 pr-6 truncate group-hover:text-indigo-600 transition-colors">
        {name}
      </h3>
      {serialNumber && <p className="text-xs text-gray-400 truncate">{serialNumber}</p>}

      {/* Live Value */}
      {lastValue !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "text-2xl font-bold tabular-nums",
                isOnline ? "text-gray-900" : "text-gray-400"
              )}
            >
              {lastValue.toLocaleString()}
            </span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          {isOnline ? (
            <Wifi className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-gray-400" />
          )}
          <span className={statusCfg.color}>{statusCfg.label}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          <span>{formatLastSeen(lastSeenAt)}</span>
        </div>
      </div>

      {/* Hover CTA */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-fast)]">
        <ChevronRight className="h-4 w-4 text-indigo-500" />
      </div>
    </Link>
  );
}
