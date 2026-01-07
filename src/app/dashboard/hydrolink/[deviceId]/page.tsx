import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { HydroLinkDashboard } from "@/components/dashboards/hydrolink-dashboard";

interface PageProps {
  params: Promise<{ deviceId: string }>;
}

export default async function HydroLinkPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const { deviceId } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardHeader user={session.user} />
      <HydroLinkDashboard deviceId={deviceId} />
    </div>
  );
}
