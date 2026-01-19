"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  ArrowLeft, Loader2, Trash2, Wifi, WifiOff, AlertTriangle,
  Cpu, Calendar, Clock, Building2, User, Package, Hash
} from "lucide-react";

interface Device {
  id: string;
  nickname: string | null;
  status: string;
  lastSeenAt: string | null;
  installedAt: string | null;
  createdAt: string;
  inventory: {
    id: string;
    serialNumber: string;
    imei: string | null;
    simNumber: string | null;
    firmwareVersion: string | null;
    deviceType: {
      id: string;
      name: string;
      code: string;
    };
  };
  subscription: {
    id: string;
    status: string;
    product: {
      id: string;
      name: string;
    };
    tenant: {
      id: string;
      companyName: string;
      email: string;
    };
  };
  provisioningProfile: {
    provisionStatus: string;
    apiKey: string | null;
    mqttUsername: string | null;
    endpointUrl: string | null;
  } | null;
}

export default function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [device, setDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState({
    nickname: "",
    status: "active",
  });

  useEffect(() => {
    async function loadDevice() {
      const { id } = await params;
      try {
        const res = await fetch(`/api/admin/devices/${id}`);
        if (!res.ok) {
          toast.error("Device not found");
          router.push("/admin/devices");
          return;
        }
        const data = await res.json();
        setDevice(data);
        setFormData({
          nickname: data.nickname || "",
          status: data.status || "active",
        });
      } catch {
        toast.error("Failed to load device");
        router.push("/admin/devices");
      } finally {
        setLoading(false);
      }
    }
    loadDevice();
  }, [params, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!device) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/devices/${device.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      toast.success("Device updated successfully");
      router.push("/admin/devices");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update device");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!device) return;
    if (!confirm("Are you sure you want to delete this device? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/devices/${device.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Device deleted");
      router.push("/admin/devices");
    } catch {
      toast.error("Failed to delete device");
    } finally {
      setDeleting(false);
    }
  };

  // Calculate connectivity status
  const getConnectivityStatus = () => {
    if (!device?.lastSeenAt) return "never_connected";
    const lastSeen = new Date(device.lastSeenAt);
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    return lastSeen >= threeHoursAgo ? "online" : "offline";
  };

  if (loading) {
    return (
      <main className="p-4 md:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </main>
    );
  }

  if (!device) {
    return null;
  }

  const connectivityStatus = getConnectivityStatus();

  return (
    <main className="p-4 md:p-6 max-w-5xl mx-auto">
      <Link href="/admin/devices" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Devices
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${
            connectivityStatus === "online" ? "bg-green-50" : 
            connectivityStatus === "offline" ? "bg-red-50" : "bg-yellow-50"
          }`}>
            {connectivityStatus === "online" ? (
              <Wifi className="h-6 w-6 text-green-600" />
            ) : connectivityStatus === "offline" ? (
              <WifiOff className="h-6 w-6 text-red-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {device.nickname || device.subscription?.product?.name || `Device ${device.id}`}
            </h1>
            <p className="text-gray-500">{device.inventory?.serialNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={
            connectivityStatus === "online" ? "bg-green-50 text-green-700 border-green-200" :
            connectivityStatus === "offline" ? "bg-red-50 text-red-700 border-red-200" :
            "bg-yellow-50 text-yellow-700 border-yellow-200"
          }>
            {connectivityStatus === "online" ? "Online" :
             connectivityStatus === "offline" ? "Offline" : "Never Connected"}
          </Badge>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Info Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hardware Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-gray-400" />
              Hardware Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Device Type</p>
                <p className="font-medium">{device.inventory?.deviceType?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type Code</p>
                <p className="font-medium font-mono">{device.inventory?.deviceType?.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="font-medium font-mono">{device.inventory?.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IMEI</p>
                <p className="font-medium font-mono">{device.inventory?.imei || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">SIM Number</p>
                <p className="font-medium font-mono">{device.inventory?.simNumber || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Firmware Version</p>
                <p className="font-medium">{device.inventory?.firmwareVersion || "—"}</p>
              </div>
            </div>
          </div>

          {/* Subscription & Tenant Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-400" />
              Subscription & Tenant
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Product</p>
                <p className="font-medium">{device.subscription?.product?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subscription Status</p>
                <Badge variant="outline" className={
                  device.subscription?.status === "active" 
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }>
                  {device.subscription?.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tenant</p>
                <p className="font-medium">{device.subscription?.tenant?.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tenant Email</p>
                <p className="font-medium">{device.subscription?.tenant?.email}</p>
              </div>
            </div>
          </div>

          {/* Provisioning Info */}
          {device.provisioningProfile && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Hash className="h-5 w-5 text-gray-400" />
                Provisioning Profile
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Provision Status</p>
                  <Badge variant="outline" className={
                    device.provisioningProfile.provisionStatus === "applied" 
                      ? "bg-green-50 text-green-700 border-green-200"
                      : device.provisioningProfile.provisionStatus === "pending"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }>
                    {device.provisioningProfile.provisionStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">MQTT Username</p>
                  <p className="font-medium font-mono text-sm">{device.provisioningProfile.mqttUsername || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Endpoint URL</p>
                  <p className="font-medium font-mono text-sm break-all">{device.provisioningProfile.endpointUrl || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Form & Timeline */}
        <div className="space-y-6">
          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Edit Device</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="e.g., Main Office Meter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Device Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </div>
          </form>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-gray-100 rounded-full mt-0.5">
                  <Calendar className="h-3 w-3 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-500">
                    {new Date(device.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              {device.installedAt && (
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-full mt-0.5">
                    <Package className="h-3 w-3 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Installed</p>
                    <p className="text-sm text-gray-500">
                      {new Date(device.installedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${
                  connectivityStatus === "online" ? "bg-green-100" : 
                  connectivityStatus === "offline" ? "bg-red-100" : "bg-yellow-100"
                }`}>
                  {connectivityStatus === "online" ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Seen</p>
                  <p className="text-sm text-gray-500">
                    {device.lastSeenAt
                      ? new Date(device.lastSeenAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Never connected"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
