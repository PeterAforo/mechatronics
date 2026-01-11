"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface DarkSidebarProps {
  brandName: string;
  navItems: NavItem[];
  bottomNavItems?: NavItem[];
  userType: "admin" | "portal";
}

export function DarkSidebar({ 
  brandName, 
  navItems, 
  bottomNavItems = [],
  userType 
}: DarkSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const baseHref = userType === "admin" ? "/admin" : "/portal";

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#1a1a2e] flex flex-col">
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6">
        <Link href={baseHref} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">{brandName}</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-white" : "text-gray-500")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      {bottomNavItems.length > 0 && (
        <div className="px-4 py-4 border-t border-white/10">
          <ul className="space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", active ? "text-white" : "text-gray-500")} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Mobile App Promo Card */}
      <div className="px-4 pb-6">
        <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl p-4 border border-purple-500/20">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
                />
              </svg>
            </div>
          </div>
          <p className="text-white text-sm font-medium text-center mb-1">
            Download Our Mobile App
          </p>
          <p className="text-gray-400 text-xs text-center">
            Monitor your devices on the go
          </p>
        </div>
      </div>
    </aside>
  );
}
