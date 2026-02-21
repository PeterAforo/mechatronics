import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DarkSidebar } from "@/components/layout/DarkSidebar";
import { LightNavbar } from "@/components/layout/LightNavbar";

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
        userType="admin"
      />

      {/* Main Content */}
      <div className="lg:ml-64">
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
        <main className="pt-14 sm:pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
