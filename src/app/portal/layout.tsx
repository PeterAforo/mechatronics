import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { 
  LayoutDashboard, Cpu, MapPin, Bell, CreditCard, 
  Settings, HelpCircle, FileText, Zap, Users, Key, BarChart3, AlertTriangle
} from "lucide-react";
import { DarkSidebar } from "@/components/layout/DarkSidebar";
import { LightNavbar } from "@/components/layout/LightNavbar";

const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/portal/devices", label: "Devices", icon: Cpu },
  { href: "/portal/sites", label: "Sites", icon: MapPin },
  { href: "/portal/alerts", label: "Alerts", icon: Bell },
  { href: "/portal/alert-rules", label: "Alert Rules", icon: AlertTriangle },
  { href: "/portal/reports", label: "Reports", icon: BarChart3 },
  { href: "/portal/subscriptions", label: "Subscriptions", icon: Zap },
  { href: "/portal/billing", label: "Billing", icon: CreditCard },
  { href: "/portal/team", label: "Team", icon: Users },
  { href: "/portal/api-keys", label: "API Keys", icon: Key },
];

const bottomNavItems = [
  { href: "/portal/settings", label: "Settings", icon: Settings },
  { href: "/portal/docs", label: "Documentation", icon: FileText },
  { href: "/portal/support", label: "Help & Support", icon: HelpCircle },
];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.userType !== "tenant") {
    if (session.user.userType === "admin") {
      redirect("/admin");
    }
    redirect("/login");
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;

  // Get tenant info
  const tenant = tenantId
    ? await prisma.tenant.findUnique({
        where: { id: tenantId },
      })
    : null;

  // Get notification count (open alerts)
  const notificationCount = tenantId
    ? await prisma.alert.count({
        where: { tenantId, status: "open" },
      })
    : 0;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Dark Sidebar */}
      <DarkSidebar
        brandName="Mechatronics"
        navItems={navItems}
        bottomNavItems={bottomNavItems}
        userType="portal"
      />

      {/* Main Content */}
      <div className="ml-64">
        {/* Light Navbar */}
        <LightNavbar
          user={{
            name: session.user.name,
            email: session.user.email,
            tenantName: tenant?.companyName || tenant?.tenantCode,
          }}
          notificationCount={notificationCount}
          userType="portal"
        />
        
        {/* Page Content */}
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
