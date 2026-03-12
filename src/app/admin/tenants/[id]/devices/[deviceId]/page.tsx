import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AdminDeviceDashboard from "./AdminDeviceDashboard";

export default async function AdminTenantDevicePage({ 
  params 
}: { 
  params: Promise<{ id: string; deviceId: string }> 
}) {
  const { id, deviceId } = await params;
  
  // Validate ids are numbers
  if (isNaN(Number(id)) || isNaN(Number(deviceId))) {
    notFound();
  }
  
  const tenant = await prisma.tenant.findUnique({
    where: { id: BigInt(id) },
  });

  if (!tenant) {
    notFound();
  }

  const device = await prisma.tenantDevice.findFirst({
    where: { 
      id: BigInt(deviceId),
      tenantId: BigInt(id),
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href={`/admin/tenants/${id}`} 
          className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {tenant.companyName}
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {device.nickname || device.inventory?.deviceType?.name || "Device"}
                </h1>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Admin View
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <Building2 className="h-4 w-4" />
                <span>{tenant.companyName}</span>
                <span>•</span>
                <span className="font-mono text-sm">{device.inventory?.serialNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Component */}
      <AdminDeviceDashboard 
        tenantId={id} 
        deviceId={deviceId}
        tenantName={tenant.companyName}
      />
    </main>
  );
}
