import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PortalSidebar from "./components/PortalSidebar";
import PortalNavbar from "./components/PortalNavbar";

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

  const user = {
    name: session.user.name,
    email: session.user.email,
    tenantName: tenant?.companyName || tenant?.tenantCode,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalSidebar />
      <PortalNavbar 
        user={user} 
        notificationCount={notificationCount}
        messageCount={0}
      />
      <main className="ml-64 pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
