import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Package, Users, Factory, ShoppingCart,
  Settings, Boxes, BarChart3, Home, LogOut, Upload, Cpu,
  Bell, Shield, FileText, CreditCard
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/device-types", label: "Device Types", icon: Factory },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/firmware", label: "Firmware OTA", icon: Cpu },
  { href: "/admin/tenants", label: "Tenants", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/alerts", label: "Alerts", icon: Bell },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: Shield },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login?type=admin");
  }

  if (session.user.userType !== "admin") {
    redirect("/login?type=admin");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-40">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#f74780]">MECHATRONICS</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 p-3 space-y-1">
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </Link>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{session.user.name || "Admin"}</p>
                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}
