"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Sparkles, Cpu } from "lucide-react";
import type { CtaPanelCardProps, CtaIllustration } from "@/types/dashboard";

const illustrationIcons: Record<CtaIllustration, React.ElementType> = {
  device: Cpu,
  rules: Settings,
  upgrade: Sparkles,
};

const illustrationColors: Record<CtaIllustration, { bg: string; icon: string }> = {
  device: { bg: "bg-indigo-50", icon: "text-indigo-500" },
  rules: { bg: "bg-amber-50", icon: "text-amber-500" },
  upgrade: { bg: "bg-purple-50", icon: "text-purple-500" },
};

export function CtaPanelCard({
  title,
  description,
  primaryAction,
  secondaryAction,
  illustration = "device",
}: CtaPanelCardProps) {
  const Icon = illustrationIcons[illustration];
  const colors = illustrationColors[illustration];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-xl", colors.bg)}>
          <Icon className={cn("h-6 w-6", colors.icon)} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <Link href={primaryAction.href} className="flex-1">
          <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4 mr-1.5" />
            {primaryAction.label}
          </Button>
        </Link>
        {secondaryAction && (
          <Link href={secondaryAction.href}>
            <Button size="sm" variant="outline" className="text-gray-600">
              {secondaryAction.label}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
