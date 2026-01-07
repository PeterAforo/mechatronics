"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Signal } from "lucide-react";
import type { ConnectivityCardProps } from "@/types/dashboard";

const statusConfig = {
  ok: { icon: Wifi, bg: "bg-emerald-50", iconColor: "text-emerald-500", border: "border-emerald-100" },
  warn: { icon: Signal, bg: "bg-amber-50", iconColor: "text-amber-500", border: "border-amber-100" },
  critical: { icon: WifiOff, bg: "bg-red-50", iconColor: "text-red-500", border: "border-red-100" },
  offline: { icon: WifiOff, bg: "bg-gray-100", iconColor: "text-gray-400", border: "border-gray-200" },
};

export function ConnectivityCard({
  title,
  message,
  action,
  status = "ok",
}: ConnectivityCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      "bg-white rounded-xl border shadow-sm p-5 h-full flex flex-col",
      config.border
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("p-2.5 rounded-xl", config.bg)}>
          <Icon className={cn("h-5 w-5", config.iconColor)} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{message}</p>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Link href={action.href}>
          <Button 
            size="sm" 
            variant="outline" 
            className={cn(
              "w-full",
              status === "critical" && "border-red-200 text-red-600 hover:bg-red-50",
              status === "warn" && "border-amber-200 text-amber-600 hover:bg-amber-50"
            )}
          >
            {action.label}
          </Button>
        </Link>
      </div>
    </div>
  );
}
