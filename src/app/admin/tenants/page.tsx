import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TenantsList from "./TenantsList";

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedTenants = tenants.map((t) => ({
    id: t.id.toString(),
    companyName: t.companyName,
    email: t.email,
    tenantCode: t.tenantCode,
    city: t.city,
    country: t.country,
    status: t.status,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Tenants</h1>
          <p className="text-gray-500 mt-1">Manage customer accounts</p>
        </div>
        <Link href="/admin/tenants/new">
          <Button className="bg-[#f74780] hover:bg-[#e03a6f] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </Button>
        </Link>
      </div>

      <TenantsList tenants={serializedTenants} />
    </main>
  );
}
