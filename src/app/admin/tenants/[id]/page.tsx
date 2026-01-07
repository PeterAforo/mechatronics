import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Mail, Phone, MapPin, Calendar, Users } from "lucide-react";

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Validate id is a number
  if (isNaN(Number(id))) {
    notFound();
  }
  
  const tenant = await prisma.tenant.findUnique({
    where: { id: BigInt(id) },
  });

  if (!tenant) {
    notFound();
  }

  const users = await prisma.tenantUser.findMany({
    where: { tenantId: BigInt(id) },
  });

  const devices = await prisma.tenantDevice.findMany({
    where: { tenantId: BigInt(id) },
  });

  const statusColors: Record<string, string> = {
    active: "border-green-200 bg-green-50 text-green-700",
    suspended: "border-red-200 bg-red-50 text-red-700",
    pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/tenants" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tenants
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Building2 className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{tenant.companyName}</h1>
              <p className="text-gray-500">{tenant.tenantCode}</p>
            </div>
          </div>
          <Badge variant="outline" className={statusColors[tenant.status] || statusColors.pending}>
            {tenant.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              {tenant.contactName && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{tenant.contactName}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{tenant.email}</span>
              </div>
              {tenant.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{tenant.phone}</span>
                </div>
              )}
              {(tenant.address || tenant.city || tenant.country) && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {[tenant.address, tenant.city, tenant.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Joined {new Date(tenant.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Users ({users.length})</h2>
            {users.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {users.map((user) => (
                  <div key={user.id.toString()} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.name || "Unnamed"}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{user.role}</Badge>
                      <Badge 
                        variant="outline" 
                        className={user.status === "active" ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-600"}
                      >
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No users found</p>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Users</span>
                <span className="font-semibold text-gray-900">{users.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Devices</span>
                <span className="font-semibold text-gray-900">{devices.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
