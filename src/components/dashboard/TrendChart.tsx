"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

interface TrendChartProps {
  title: string;
  data: DataPoint[];
  unit?: string;
  color?: string;
  showArea?: boolean;
  height?: number;
  className?: string;
  trend?: {
    value: number;
    label: string;
  };
}

const timeRanges = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
];

export function TrendChart({
  title,
  data,
  unit = "",
  color = "#4f46e5",
  showArea = true,
  height = 280,
  className,
  trend,
}: TrendChartProps) {
  const [activeRange, setActiveRange] = useState("today");

  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
      ? TrendingDown
      : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? "text-emerald-600"
      : trend.value < 0
      ? "text-red-600"
      : "text-gray-500"
    : "";

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
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {trend && TrendIcon && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>
                {trend.value > 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setActiveRange(range.value)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-[var(--duration-fast)]",
                activeRange === range.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 py-4">
        <ResponsiveContainer width="100%" height={height} minHeight={200}>
          {showArea ? (
            <AreaChart data={Array.isArray(data) ? data : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(value) => `${value}${unit}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value ?? 0}${unit}`, "Value"]}
                labelStyle={{ color: "#374151", fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
                animationDuration={500}
                animationEasing="ease-out"
              />
            </AreaChart>
          ) : (
            <LineChart data={Array.isArray(data) ? data : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(value) => `${value}${unit}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value ?? 0}${unit}`, "Value"]}
                labelStyle={{ color: "#374151", fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: color }}
                animationDuration={500}
                animationEasing="ease-out"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
