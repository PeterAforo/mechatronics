"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Package, Users, Factory, ShoppingCart,
  Settings, Boxes, BarChart3, Home, Cpu,
  Bell, Shield, CreditCard, Radio,
  LayoutDashboard, Wifi, AlertTriangle, Building2,
  Key, FileText, LucideIcon, Menu, X
} from "lucide-react";
import { useState, useEffect } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
}

interface DarkSidebarProps {
  brandName: string;
  userType: "admin" | "portal";
  isOpen?: boolean;
  onToggle?: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  Home, LayoutDashboard, Radio, Package, Factory, Boxes, Cpu,
  Users, ShoppingCart, CreditCard, Bell, Shield, BarChart3,
  Settings, Wifi, AlertTriangle, Building2, Key, FileText
};

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "Home", exact: true },
  { href: "/admin/telemetry", label: "Telemetry", icon: "Radio" },
  { href: "/admin/products", label: "Products", icon: "Package" },
  { href: "/admin/device-types", label: "Device Types", icon: "Factory" },
  { href: "/admin/inventory", label: "Inventory", icon: "Boxes" },
  { href: "/admin/firmware", label: "Firmware OTA", icon: "Cpu" },
  { href: "/admin/tenants", label: "Tenants", icon: "Users" },
  { href: "/admin/orders", label: "Orders", icon: "ShoppingCart" },
  { href: "/admin/payments", label: "Payments", icon: "CreditCard" },
  { href: "/admin/alerts", label: "Alerts", icon: "Bell" },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: "Shield" },
  { href: "/admin/reports", label: "Reports", icon: "BarChart3" },
];

const adminBottomNavItems: NavItem[] = [
  { href: "/admin/settings", label: "Settings", icon: "Settings" },
];

const portalNavItems: NavItem[] = [
  { href: "/portal", label: "Dashboard", icon: "LayoutDashboard", exact: true },
  { href: "/portal/devices", label: "Devices", icon: "Cpu" },
  { href: "/portal/sites", label: "Sites", icon: "Building2" },
  { href: "/portal/alerts", label: "Alerts", icon: "Bell" },
  { href: "/portal/alert-rules", label: "Alert Rules", icon: "AlertTriangle" },
  { href: "/portal/subscriptions", label: "Subscriptions", icon: "CreditCard" },
  { href: "/portal/billing", label: "Billing", icon: "FileText" },
  { href: "/portal/reports", label: "Reports", icon: "BarChart3" },
  { href: "/portal/team", label: "Team", icon: "Users" },
  { href: "/portal/api-keys", label: "API Keys", icon: "Key" },
];

const portalBottomNavItems: NavItem[] = [
  { href: "/portal/settings", label: "Settings", icon: "Settings" },
];

export function DarkSidebar({ 
  brandName, 
  userType,
  isOpen = false,
  onToggle
}: DarkSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = userType === "admin" ? adminNavItems : portalNavItems;
  const bottomNavItems = userType === "admin" ? adminBottomNavItems : portalBottomNavItems;

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const baseHref = userType === "admin" ? "/admin" : "/portal";

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const handleToggle = () => {
    setIsMobileOpen(!isMobileOpen);
    onToggle?.();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={handleToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1a2e] rounded-xl shadow-lg text-white hover:bg-[#252542] transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 bg-[#1a1a2e] flex flex-col transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
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
            const Icon = iconMap[item.icon] || Home;
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
              const Icon = iconMap[item.icon] || Settings;
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

      {/* Mobile App Promo Card - Hidden on smaller screens to save space */}
      <div className="px-4 pb-6 hidden sm:block">
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
    </>
  );
}
