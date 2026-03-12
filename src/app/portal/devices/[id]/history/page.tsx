import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import DeviceHistory from "./DeviceHistory";

export default async function DeviceHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.userType !== "tenant") {
    redirect("/login");
  }

  const { id } = await params;
  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;

  if (!tenantId) {
    redirect("/login");
  }

  // Verify device exists and belongs to tenant
  const device = await prisma.tenantDevice.findFirst({
    where: { 
      id: BigInt(id),
      tenantId,
    },
    include: {
      inventory: {
        include: {
          deviceType: true,
        },
      },
    },
  });

  if (!device) {
    notFound();
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link 
            href={`/portal/devices/${id}`} 
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
        </div>
        <Link href={`/portal/devices/${id}/settings`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>

      <DeviceHistory 
        deviceId={id} 
        deviceName={device.nickname || device.inventory?.deviceType?.name || "Device"}
      />
    </div>
  );
}
