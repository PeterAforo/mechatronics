"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { HealthGaugeCardProps } from "@/types/dashboard";

const statusColors = {
  ok: { ring: "stroke-emerald-500", bg: "bg-emerald-500", text: "text-emerald-600" },
  warn: { ring: "stroke-amber-500", bg: "bg-amber-500", text: "text-amber-600" },
  critical: { ring: "stroke-red-500", bg: "bg-red-500", text: "text-red-600" },
  offline: { ring: "stroke-gray-400", bg: "bg-gray-400", text: "text-gray-500" },
};

function GaugeRing({ value, status }: { value: number; status?: keyof typeof statusColors }) {
  const colors = statusColors[status || "ok"];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="8"
        />
        {/* Progress ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className={cn("transition-all duration-500 ease-out", colors.ring)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      {/* Center value */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-2xl font-bold", colors.text)}>{value}%</span>
      </div>
    </div>
  );
}

export function HealthGaugeCard({
  title,
  value,
  caption,
  deltaText,
  status = "ok",
}: HealthGaugeCardProps) {
  // Parse delta for trend icon
  const deltaMatch = deltaText?.match(/(\d+)%\s*(higher|lower|more|less)/i);
  const isPositive = deltaMatch?.[2]?.toLowerCase().includes("higher") || 
                     deltaMatch?.[2]?.toLowerCase().includes("more");

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="flex items-center justify-between">
        <GaugeRing value={value} status={status} />
        
        <div className="flex-1 ml-4">
          {caption && (
            <p className="text-sm text-gray-600 mb-2">{caption}</p>
          )}
          {deltaText && (
            <div className="flex items-center gap-1.5">
              {isPositive !== undefined && (
                isPositive ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-emerald-500" />
                )
              )}
              <span className={cn(
                "text-xs font-medium",
                isPositive ? "text-red-600" : "text-emerald-600"
              )}>
                {deltaText}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
