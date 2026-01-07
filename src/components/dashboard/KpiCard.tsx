"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  Droplets, Zap, Cpu, AlertTriangle, TrendingUp, TrendingDown, Minus,
  LucideIcon
} from "lucide-react";
import type { KpiCardProps, KpiStatus } from "@/types/dashboard";

const iconMap: Record<string, LucideIcon> = {
  water: Droplets,
  power: Zap,
  devices: Cpu,
  alerts: AlertTriangle,
};

const statusColors: Record<KpiStatus, { bg: string; text: string; border: string }> = {
  ok: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  warn: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  critical: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
  neutral: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100" },
};

function MiniSparkline({ data, status }: { data: number[]; status?: KpiStatus }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  const stepX = width / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const strokeColor = status === "critical" ? "#dc2626" : status === "warn" ? "#d97706" : "#4f46e5";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KpiCard({
  title,
  value,
  subtitle,
  status = "neutral",
  sparkline,
  icon,
  href,
}: KpiCardProps) {
  const colors = statusColors[status];
  const Icon = icon ? iconMap[icon] || Cpu : null;

  // Parse trend from subtitle
  const trendMatch = subtitle?.match(/([+-]?\d+\.?\d*)%/);
  const trendValue = trendMatch ? parseFloat(trendMatch[1]) : null;
  const TrendIcon = trendValue !== null 
    ? trendValue > 0 ? TrendingUp : trendValue < 0 ? TrendingDown : Minus
    : null;

  const content = (
    <div
      className={cn(
        "bg-white rounded-xl p-5 border shadow-sm",
        "transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]",
        href && "hover:shadow-md hover:border-indigo-200 cursor-pointer",
        colors.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">{value}</p>
          {subtitle && (
            <div className="flex items-center gap-1 mt-1">
              {TrendIcon && (
                <TrendIcon className={cn(
                  "h-3.5 w-3.5",
                  trendValue && trendValue > 0 ? "text-emerald-500" : 
                  trendValue && trendValue < 0 ? "text-red-500" : "text-gray-400"
                )} />
              )}
              <p className={cn(
                "text-xs",
                trendValue && trendValue > 0 ? "text-emerald-600" : 
                trendValue && trendValue < 0 ? "text-red-600" : "text-gray-500"
              )}>
                {subtitle}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {Icon && (
            <div className={cn("p-2.5 rounded-xl", colors.bg)}>
              <Icon className={cn("h-5 w-5", colors.text)} />
            </div>
          )}
          {sparkline && sparkline.length > 1 && (
            <MiniSparkline data={sparkline} status={status} />
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
