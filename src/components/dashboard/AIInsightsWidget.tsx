"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X, ChevronRight, Lightbulb, TrendingUp, AlertCircle, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIInsight, AIInsightsWidgetProps as BaseProps } from "@/types/dashboard";

// Extended interface for backward compatibility
interface Insight {
  id: string;
  type: "optimization" | "anomaly" | "prediction" | "tip" | "recommendation" | "behavior";
  title: string;
  description?: string;
  summary?: string;
  link?: string;
  linkText?: string;
  actionLabel?: string;
  actionHref?: string;
  priority?: "low" | "medium" | "high";
  severity?: "info" | "warn" | "critical";
  deviceId?: string;
  timestamp?: string;
}

interface AIInsightsWidgetProps {
  insights: Insight[];
  maxVisible?: number;
  rotate?: boolean;
  className?: string;
  onDismiss?: (id: string) => void;
}

const insightIcons = {
  optimization: TrendingUp,
  anomaly: AlertCircle,
  prediction: Sparkles,
  tip: Lightbulb,
  recommendation: Brain,
  behavior: TrendingUp,
};

// Map severity to priority for backward compatibility
const severityToPriority = {
  info: "low",
  warn: "medium",
  critical: "high",
} as const;

const priorityColors = {
  low: "border-l-blue-400 bg-blue-50/50",
  medium: "border-l-amber-400 bg-amber-50/50",
  high: "border-l-red-400 bg-red-50/50",
};

export function AIInsightsWidget({ insights, maxVisible = 5, rotate = true, className, onDismiss }: AIInsightsWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleInsights = insights.filter((i) => !dismissedIds.has(i.id)).slice(0, maxVisible);
  const currentInsight = visibleInsights[currentIndex % visibleInsights.length];

  useEffect(() => {
    if (!rotate || visibleInsights.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleInsights.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [visibleInsights.length, rotate]);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    onDismiss?.(id);
  };

  if (!isVisible || visibleInsights.length === 0) {
    return null;
  }

  const Icon = insightIcons[currentInsight.type] || Sparkles;
  
  // Support both old (priority) and new (severity) props
  const insightPriority = currentInsight.priority || 
    (currentInsight.severity ? severityToPriority[currentInsight.severity] : "low");
  
  // Support both old (description) and new (summary) props
  const insightDescription = currentInsight.description || currentInsight.summary || "";
  
  // Support both old (link/linkText) and new (actionHref/actionLabel) props
  const actionLink = currentInsight.link || currentInsight.actionHref;
  const actionText = currentInsight.linkText || currentInsight.actionLabel || "View details";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm",
        "transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-100 rounded-lg">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <span className="text-sm font-medium text-indigo-900">AI Insights</span>
          {visibleInsights.length > 1 && (
            <span className="text-xs text-indigo-500 bg-indigo-100 px-1.5 py-0.5 rounded-full">
              {currentIndex + 1}/{visibleInsights.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          aria-label="Hide insights"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div
        className={cn(
          "p-4 border-l-4 transition-all duration-[var(--duration-normal)]",
          priorityColors[insightPriority]
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "p-2 rounded-lg shrink-0",
              currentInsight.type === "anomaly"
                ? "bg-red-100 text-red-600"
                : currentInsight.type === "optimization" || currentInsight.type === "recommendation"
                ? "bg-emerald-100 text-emerald-600"
                : currentInsight.type === "prediction"
                ? "bg-purple-100 text-purple-600"
                : "bg-blue-100 text-blue-600"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">{currentInsight.title}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{insightDescription}</p>
            {actionLink && (
              <Link
                href={actionLink}
                className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                {actionText}
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          <button
            onClick={() => handleDismiss(currentInsight.id)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors shrink-0"
            aria-label="Dismiss insight"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress indicator for rotation */}
      {visibleInsights.length > 1 && (
        <div className="flex gap-1 px-4 pb-3">
          {visibleInsights.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-1 rounded-full transition-all duration-[var(--duration-normal)]",
                idx === currentIndex % visibleInsights.length
                  ? "w-6 bg-indigo-500"
                  : "w-2 bg-gray-200 hover:bg-gray-300"
              )}
              aria-label={`View insight ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
