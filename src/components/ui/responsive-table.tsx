"use client";

import { cn } from "@/lib/utils";

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component for tables that enables horizontal scrolling on mobile
 * while maintaining full-width display on larger screens.
 */
export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn(
      "overflow-x-auto -mx-4 sm:mx-0 scroll-touch",
      className
    )}>
      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
        {children}
      </div>
    </div>
  );
}

/**
 * A table wrapper with scroll shadow indicators
 */
export function ResponsiveTableWithShadow({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn(
      "relative",
      className
    )}>
      {/* Left shadow indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 sm:hidden" />
      {/* Right shadow indicator */}
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 sm:hidden" />
      
      <div className="overflow-x-auto scroll-touch scrollbar-hide">
        <div className="inline-block min-w-full align-middle">
          {children}
        </div>
      </div>
    </div>
  );
}
