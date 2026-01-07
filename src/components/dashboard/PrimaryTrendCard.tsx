"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import type { PrimaryTrendCardProps, TrendRange } from "@/types/dashboard";

const rangeOptions: { label: string; value: TrendRange }[] = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
];

const chipToneColors = {
  neutral: "bg-gray-100 text-gray-700",
  good: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  bad: "bg-red-50 text-red-700",
};

export function PrimaryTrendCard({
  title,
  range,
  onRangeChange,
  series,
  unit,
  thresholds,
  summaryChips,
  aiMarkers,
}: PrimaryTrendCardProps) {
  const [activeRange, setActiveRange] = useState<TrendRange>(range);

  const handleRangeChange = (r: TrendRange) => {
    setActiveRange(r);
    onRangeChange?.(r);
  };

  // Transform series data for recharts
  const chartData = series.map((point) => ({
    time: point.t,
    value: point.v,
  }));

  // Find AI marker positions
  const markerData = aiMarkers?.map((marker) => {
    const dataPoint = chartData.find((d) => d.time === marker.t);
    return dataPoint ? { ...marker, value: dataPoint.value } : null;
  }).filter(Boolean);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {aiMarkers && aiMarkers.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 rounded-full">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span className="text-xs font-medium text-indigo-600">
                {aiMarkers.length} AI insight{aiMarkers.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {rangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleRangeChange(opt.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150",
                activeRange === opt.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Chips */}
      {summaryChips && summaryChips.length > 0 && (
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50">
          {summaryChips.map((chip, idx) => (
            <div
              key={idx}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium",
                chipToneColors[chip.tone || "neutral"]
              )}
            >
              <span className="text-gray-500">{chip.label}:</span>{" "}
              <span className="font-semibold">{chip.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="px-4 py-4">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="time"
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
              formatter={(value) => [`${value}${unit}`, "Value"]}
              labelStyle={{ color: "#374151", fontWeight: 600 }}
            />

            {/* Threshold lines */}
            {thresholds?.low && (
              <ReferenceLine
                y={thresholds.low}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Low: ${thresholds.low}${unit}`,
                  position: "right",
                  fill: "#f59e0b",
                  fontSize: 10,
                }}
              />
            )}
            {thresholds?.critical && (
              <ReferenceLine
                y={thresholds.critical}
                stroke="#dc2626"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Critical: ${thresholds.critical}${unit}`,
                  position: "right",
                  fill: "#dc2626",
                  fontSize: 10,
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="value"
              stroke="#4f46e5"
              strokeWidth={2}
              fill="url(#colorValue)"
              animationDuration={500}
              animationEasing="ease-out"
            />

            {/* AI Markers */}
            {markerData?.map((marker, idx) => (
              <ReferenceDot
                key={idx}
                x={marker?.t}
                y={marker?.value}
                r={6}
                fill={
                  marker?.severity === "critical" ? "#dc2626" :
                  marker?.severity === "warn" ? "#f59e0b" : "#4f46e5"
                }
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* AI Markers Legend */}
      {aiMarkers && aiMarkers.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4 flex-wrap">
            {aiMarkers.map((marker, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    marker.severity === "critical" ? "bg-red-500" :
                    marker.severity === "warn" ? "bg-amber-500" : "bg-indigo-500"
                  )}
                />
                <span className="text-xs text-gray-600">{marker.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
