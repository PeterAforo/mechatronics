"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Package, Users, Factory, ShoppingCart,
  Settings, Boxes, BarChart3, Home, Cpu,
  Bell, Shield, CreditCard, Radio,
  LayoutDashboard, Wifi, AlertTriangle, Building2,
  Key, FileText, LucideIcon, Menu, X, Code, DollarSign,
  ChevronDown
} from "lucide-react";
import { useState, useEffect } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
}

interface NavCategory {
  name: string;
  items: NavItem[];
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
  Settings, Wifi, AlertTriangle, Building2, Key, FileText, Code, DollarSign
};

const adminNavCategories: NavCategory[] = [
  {
    name: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: "Home", exact: true },
      { href: "/admin/telemetry", label: "Telemetry", icon: "Radio" },
    ],
  },
  {
    name: "Devices",
    items: [
      { href: "/admin/devices", label: "All Devices", icon: "Wifi" },
      { href: "/admin/device-types", label: "Device Types", icon: "Factory" },
      { href: "/admin/inventory", label: "Inventory", icon: "Boxes" },
      { href: "/admin/firmware", label: "Firmware OTA", icon: "Cpu" },
    ],
  },
  {
    name: "Commerce",
    items: [
      { href: "/admin/products", label: "Products", icon: "Package" },
      { href: "/admin/orders", label: "Orders", icon: "ShoppingCart" },
      { href: "/admin/payments", label: "Payments", icon: "CreditCard" },
      { href: "/admin/revenue", label: "Revenue", icon: "DollarSign" },
    ],
  },
  {
    name: "Operations",
    items: [
      { href: "/admin/tenants", label: "Tenants", icon: "Users" },
      { href: "/admin/alerts", label: "Alerts", icon: "Bell" },
      { href: "/admin/alerts/rules", label: "Alert Rules", icon: "AlertTriangle" },
    ],
  },
  {
    name: "System",
    items: [
      { href: "/admin/audit-logs", label: "Audit Logs", icon: "Shield" },
      { href: "/admin/reports", label: "Reports", icon: "BarChart3" },
      { href: "/admin/api-docs", label: "API Docs", icon: "Code" },
      { href: "/admin/settings", label: "Settings", icon: "Settings" },
    ],
  },
];

const portalNavCategories: NavCategory[] = [
  {
    name: "Overview",
    items: [
      { href: "/portal", label: "Dashboard", icon: "LayoutDashboard", exact: true },
    ],
  },
  {
    name: "Devices",
    items: [
      { href: "/portal/devices", label: "My Devices", icon: "Cpu" },
      { href: "/portal/sites", label: "Sites", icon: "Building2" },
    ],
  },
  {
    name: "Monitoring",
    items: [
      { href: "/portal/alerts", label: "Alerts", icon: "Bell" },
      { href: "/portal/alert-rules", label: "Alert Rules", icon: "AlertTriangle" },
      { href: "/portal/reports", label: "Reports", icon: "BarChart3" },
    ],
  },
  {
    name: "Account",
    items: [
      { href: "/portal/subscriptions", label: "Subscriptions", icon: "CreditCard" },
      { href: "/portal/billing", label: "Billing", icon: "FileText" },
      { href: "/portal/team", label: "Team", icon: "Users" },
      { href: "/portal/api-keys", label: "API Keys", icon: "Key" },
      { href: "/portal/settings", label: "Settings", icon: "Settings" },
    ],
  },
];

export function DarkSidebar({ 
  brandName, 
  userType,
  isOpen = false,
  onToggle
}: DarkSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const navCategories = userType === "admin" ? adminNavCategories : portalNavCategories;

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

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
          <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center p-1.5">
            <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
              <rect x="5" y="10" width="4" height="16" rx="1.5" fill="white"/>
              <rect x="11" y="6" width="4" height="20" rx="1.5" fill="white"/>
              <rect x="17" y="8" width="4" height="18" rx="1.5" fill="white"/>
              <circle cx="7" cy="7" r="2" fill="white"/>
              <circle cx="13" cy="3" r="2" fill="white"/>
              <circle cx="19" cy="5" r="2" fill="white"/>
              <path d="M7 7 L13 3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M13 3 L19 5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-white">{brandName}</span>
        </Link>
      </div>

      {/* Main Navigation with Collapsible Categories */}
      <nav className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {navCategories.map((category) => {
            const isCollapsed = collapsedCategories.has(category.name);
            const hasActiveItem = category.items.some(item => isActive(item.href, item.exact));
            
            return (
              <div key={category.name}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
                >
                  <span>{category.name}</span>
                  <ChevronDown 
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      isCollapsed ? "-rotate-90" : ""
                    )} 
                  />
                </button>
                
                {/* Category Items */}
                <div className={cn(
                  "space-y-0.5 overflow-hidden transition-all duration-200",
                  isCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
                )}>
                  {category.items.map((item) => {
                    const Icon = iconMap[item.icon] || Home;
                    const active = isActive(item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                          active
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", active ? "text-white" : "text-gray-500")} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
    </>
  );
}
