import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
  Package, Users, Factory, ShoppingCart,
  Settings, Boxes, BarChart3, Home, Cpu,
  Bell, Shield, CreditCard, Radio
} from "lucide-react";
import { DarkSidebar } from "@/components/layout/DarkSidebar";
import { LightNavbar } from "@/components/layout/LightNavbar";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home, exact: true },
  { href: "/admin/telemetry", label: "Telemetry", icon: Radio },
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

const bottomNavItems = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
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
    <div className="min-h-screen bg-[#fafafa]">
      {/* Dark Sidebar */}
      <DarkSidebar
        brandName="Mechatronics"
        navItems={navItems}
        bottomNavItems={bottomNavItems}
        userType="admin"
      />

      {/* Main Content */}
      <div className="ml-64">
        {/* Light Navbar */}
        <LightNavbar
          user={{
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
          }}
          notificationCount={0}
          userType="admin"
        />
        
        {/* Page Content */}
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
