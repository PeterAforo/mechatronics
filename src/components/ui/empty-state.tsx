import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        "bg-white rounded-xl border border-gray-100 shadow-sm",
        className
      )}
    >
      <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-xl mb-4">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      {action && (
        <Link href={action.href}>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}
