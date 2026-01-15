import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Mail, Phone, MapPin, Calendar, Users, Cpu, Link2 } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import AssignDeviceDialog from "./AssignDeviceDialog";
import TenantActions from "./TenantActions";

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
    include: {
      inventory: {
        include: {
          deviceType: {
            include: {
              variables: true,
            },
          },
        },
      },
    },
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
          <div className="flex items-center gap-3">
            <TenantActions 
              tenant={{
                id: tenant.id.toString(),
                companyName: tenant.companyName,
                contactName: tenant.contactName,
                email: tenant.email,
                phone: tenant.phone,
                address: tenant.address,
                city: tenant.city,
                country: tenant.country,
                status: tenant.status,
              }}
            />
            <AssignDeviceDialog tenantId={id} tenantName={tenant.companyName} />
            <Badge variant="outline" className={statusColors[tenant.status] || statusColors.pending}>
              {tenant.status}
            </Badge>
          </div>
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

          {/* Device Telemetry Links */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Device Telemetry Links</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Use these URLs to configure devices to send telemetry data to the platform.
            </p>
            {devices.length > 0 ? (
              <div className="space-y-6">
                {devices.map((device) => {
                  const deviceType = device.inventory?.deviceType;
                  const variables = deviceType?.variables || [];
                  const serialNumber = device.inventory?.serialNumber || `DEV${device.id}`;
                  
                  // Build variable pairs in format VAR1:VAL1/VAR2:VAL2
                  const variablePairs = variables.map(v => `${v.variableCode}:{value}`).join("/");
                  const tempParam = variablePairs || "VAR:{value}";
                  
                  // Legacy telemetry URL format
                  const telemetryUrl = `https://mechatronics.com.gh/api/ingest/legacy?temp=${tempParam}&hum=${deviceType?.typeCode || "CODE"}&CID=${tenant.id}&DID=${serialNumber}`;
                  
                  // Example URL with sample values
                  const exampleValues = variables.map(v => `${v.variableCode}:25.5`).join("/") || "WL:75.5";
                  const exampleUrl = `https://mechatronics.com.gh/api/ingest/legacy?temp=${exampleValues}&hum=${deviceType?.typeCode || "CODE"}&CID=${tenant.id}&DID=${serialNumber}`;
                  
                  return (
                    <div key={device.id.toString()} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{device.nickname || `Device ${device.id}`}</span>
                          {deviceType && (
                            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                              {deviceType.name}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className={device.status === "active" ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200"}>
                          {device.status}
                        </Badge>
                      </div>
                      
                      {/* Device Serial */}
                      <div className="mb-3 flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Serial Number:</span>
                        <code className="bg-white px-2 py-1 rounded border border-gray-200 font-mono text-gray-900">{serialNumber}</code>
                      </div>
                      
                      {/* Telemetry URL Template */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Telemetry URL Template:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs font-mono bg-white px-3 py-2 rounded border border-gray-200 overflow-x-auto whitespace-nowrap">
                            {telemetryUrl}
                          </code>
                          <CopyButton text={telemetryUrl} />
                        </div>
                      </div>
                      
                      {/* Example URL */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Example URL (with sample values):</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs font-mono bg-green-50 px-3 py-2 rounded border border-green-200 text-green-800 overflow-x-auto whitespace-nowrap">
                            {exampleUrl}
                          </code>
                          <CopyButton text={exampleUrl} />
                        </div>
                      </div>
                      
                      {/* Variables */}
                      {variables.length > 0 && (
                        <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">Device Type Variables ({deviceType?.typeCode}):</p>
                          <div className="grid grid-cols-2 gap-2">
                            {variables.map((variable) => (
                              <div key={variable.id.toString()} className="flex items-center gap-2 text-xs">
                                <code className="bg-gray-100 px-2 py-1 rounded font-mono text-blue-700">{variable.variableCode}</code>
                                <span className="text-gray-500">{variable.label}</span>
                                <span className="text-gray-400">({variable.unit || "—"})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Parameters Summary */}
                      <div className="mt-3 text-xs text-gray-500">
                        <span className="font-medium">URL Parameters:</span>
                        <ul className="mt-1 ml-4 list-disc">
                          <li><code className="bg-gray-100 px-1 rounded">temp</code> = Variable readings in format <code className="bg-gray-100 px-1 rounded">VAR1:VAL1/VAR2:VAL2</code></li>
                          <li><code className="bg-gray-100 px-1 rounded">hum</code> = Device type code: <strong>{deviceType?.typeCode || "CODE"}</strong></li>
                          <li><code className="bg-gray-100 px-1 rounded">CID</code> = Tenant ID: <strong>{tenant.id.toString()}</strong></li>
                          <li><code className="bg-gray-100 px-1 rounded">DID</code> = Device Serial: <strong>{serialNumber}</strong></li>
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Cpu className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No devices assigned to this tenant</p>
                <p className="text-sm mt-1">Devices will appear here after purchase and assignment</p>
              </div>
            )}

            {/* General Telemetry Endpoint Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-900 mb-2">API Endpoint Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Base URL:</span>
                  <code className="ml-2 bg-white px-2 py-1 rounded text-blue-800">https://mechatronics.com.gh/api/ingest/legacy</code>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Method:</span>
                  <code className="ml-2 bg-white px-2 py-1 rounded text-blue-800">GET</code>
                </div>
                <div className="text-blue-700">
                  <span className="font-medium">URL Format:</span>
                  <div className="mt-1 bg-white p-2 rounded border border-blue-200">
                    <code className="text-xs text-blue-800 break-all">
                      https://mechatronics.com.gh/api/ingest/legacy?temp=VAR1:VAL1/VAR2:VAL2&hum=CODE&CID=TENANT_ID&DID=DEVICE_SERIAL
                    </code>
                  </div>
                </div>
                <div className="text-blue-700 mt-3">
                  <span className="font-medium">Parameters:</span>
                  <ul className="mt-1 ml-4 list-disc text-blue-600">
                    <li><code className="bg-white px-1 rounded">temp</code> — Variable readings (format: VAR1:VALUE1/VAR2:VALUE2)</li>
                    <li><code className="bg-white px-1 rounded">hum</code> — Device type code (e.g., WAT100, PWR100)</li>
                    <li><code className="bg-white px-1 rounded">CID</code> — Tenant ID: <strong>{tenant.id.toString()}</strong></li>
                    <li><code className="bg-white px-1 rounded">DID</code> — Device Serial Number</li>
                  </ul>
                </div>
              </div>
            </div>
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
