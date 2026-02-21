import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DarkSidebar } from "@/components/layout/DarkSidebar";
import { LightNavbar } from "@/components/layout/LightNavbar";

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
        userType="portal"
      />

      {/* Main Content */}
      <div className="lg:ml-64">
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
        <main className="pt-14 sm:pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
