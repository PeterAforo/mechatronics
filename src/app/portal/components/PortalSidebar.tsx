"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Cpu, MapPin, Bell, CreditCard, 
  Settings, HelpCircle, FileText, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const menuItems = [
  { 
    label: "Dashboard", 
    href: "/portal", 
    icon: LayoutDashboard,
    exact: true 
  },
  { 
    label: "Devices", 
    href: "/portal/devices", 
    icon: Cpu 
  },
  { 
    label: "Sites", 
    href: "/portal/sites", 
    icon: MapPin 
  },
  { 
    label: "Alerts", 
    href: "/portal/alerts", 
    icon: Bell 
  },
  { 
    label: "Subscriptions", 
    href: "/portal/subscriptions", 
    icon: Zap 
  },
  { 
    label: "Billing", 
    href: "/portal/billing", 
    icon: CreditCard 
  },
];

const bottomMenuItems = [
  { 
    label: "Settings", 
    href: "/portal/settings", 
    icon: Settings 
  },
  { 
    label: "Documentation", 
    href: "/portal/docs", 
    icon: FileText 
  },
  { 
    label: "Help & Support", 
    href: "/portal/support", 
    icon: HelpCircle 
  },
];

export default function PortalSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <Logo href="/portal" size="md" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-[#f74780]/10 text-[#f74780]"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-[#f74780]" : "text-gray-400")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-gray-100">
        <ul className="space-y-1">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-[#f74780]/10 text-[#f74780]"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-[#f74780]" : "text-gray-400")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
