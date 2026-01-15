"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, ChevronRight, Users } from "lucide-react";
import BulkDeleteTable from "@/components/admin/BulkDeleteTable";

interface Tenant {
  id: string;
  companyName: string;
  email: string;
  tenantCode: string;
  city: string | null;
  country: string | null;
  status: string;
}

interface TenantsListProps {
  tenants: Tenant[];
}

const statusColors: Record<string, string> = {
  active: "border-green-200 bg-green-50 text-green-700",
  suspended: "border-red-200 bg-red-50 text-red-700",
  pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
};

export default function TenantsList({ tenants }: TenantsListProps) {
  return (
    <BulkDeleteTable
      items={tenants}
      deleteEndpoint="/api/admin/tenants/bulk-delete"
      itemName="tenant"
      itemNamePlural="tenants"
      emptyState={
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-4">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No tenants yet</h3>
          <p className="text-gray-500 mb-4">Tenants will appear here when they register</p>
        </div>
      }
      renderItem={(tenant, isSelected, onToggle) => (
        <div className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${tenant.companyName}`}
          />
          <Link
            href={`/admin/tenants/${tenant.id}`}
            className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 bg-orange-50 rounded-lg">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{tenant.companyName}</p>
                <p className="text-sm text-gray-500">
                  {tenant.email} • {tenant.tenantCode}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 ml-11 sm:ml-0">
              <div className="text-left sm:text-right text-sm text-gray-500">
                {tenant.city && `${tenant.city}, `}{tenant.country}
              </div>
              <Badge variant="outline" className={statusColors[tenant.status] || statusColors.pending}>
                {tenant.status}
              </Badge>
              <ChevronRight className="h-4 w-4 text-gray-400 hidden sm:block" />
            </div>
          </Link>
        </div>
      )}
    />
  );
}
