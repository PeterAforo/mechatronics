"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Upload, Package, CheckCircle, AlertTriangle, Send, Radio } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DeviceType {
  id: string;
  typeCode: string;
  name: string;
}

interface FirmwareVersion {
  id: string;
  deviceTypeId: string;
  version: string;
  releaseNotes: string | null;
  fileUrl: string;
  fileSize: number;
  checksum: string;
  isStable: boolean;
  isMandatory: boolean;
  createdAt: string;
}

interface OtaUpdate {
  id: string;
  tenantDeviceId: string;
  deviceNickname: string;
  deviceSerial: string;
  tenantName: string;
  deviceType: string;
  firmwareVersion: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export default function FirmwarePage() {
  const [loading, setLoading] = useState(true);
  const [firmware, setFirmware] = useState<FirmwareVersion[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [otaUpdates, setOtaUpdates] = useState<OtaUpdate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [otaDialogOpen, setOtaDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [selectedFirmware, setSelectedFirmware] = useState<FirmwareVersion | null>(null);
  
  const [formData, setFormData] = useState({
    deviceTypeId: "",
    version: "",
    releaseNotes: "",
    fileUrl: "",
    fileSize: "",
    checksum: "",
    isStable: false,
    isMandatory: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fwRes, dtRes, otaRes] = await Promise.all([
        fetch("/api/admin/firmware"),
        fetch("/api/admin/device-types"),
        fetch("/api/admin/ota"),
      ]);
      
      if (fwRes.ok) setFirmware(await fwRes.json());
      if (dtRes.ok) {
        const dtData = await dtRes.json();
        setDeviceTypes(Array.isArray(dtData) ? dtData : (dtData.deviceTypes || []));
      }
      if (otaRes.ok) setOtaUpdates(await otaRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePushOta = async () => {
    if (!selectedFirmware) return;
    
    setPushing(true);
    try {
      const res = await fetch("/api/admin/ota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firmwareId: selectedFirmware.id,
          pushToAll: true,
          deviceTypeId: selectedFirmware.deviceTypeId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "OTA update pushed successfully!");
        setOtaDialogOpen(false);
        setSelectedFirmware(null);
        fetchData();
      } else {
        toast.error(data.error || "Failed to push OTA update");
      }
    } catch {
      toast.error("Failed to push OTA update");
    } finally {
      setPushing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Failed</Badge>;
      case "downloading":
      case "installing":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">{status}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Pending</Badge>;
    }
  };

  const handleCreate = async () => {
    if (!formData.deviceTypeId || !formData.version || !formData.fileUrl || !formData.fileSize || !formData.checksum) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/firmware", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fileSize: parseInt(formData.fileSize),
        }),
      });

      if (res.ok) {
        toast.success("Firmware version created!");
        setDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create firmware");
      }
    } catch {
      toast.error("Failed to create firmware");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deviceTypeId: "",
      version: "",
      releaseNotes: "",
      fileUrl: "",
      fileSize: "",
      checksum: "",
      isStable: false,
      isMandatory: false,
    });
  };

  const getDeviceTypeName = (id: string) => {
    const dt = deviceTypes.find((d) => d.id === id);
    return dt ? `${dt.name} (${dt.typeCode})` : "Unknown";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Firmware & OTA Management</h1>
          <p className="text-gray-500 mt-1">Manage firmware versions and push OTA updates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Firmware
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Firmware Version</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Device Type *</Label>
                  <Select value={formData.deviceTypeId} onValueChange={(v) => setFormData({ ...formData, deviceTypeId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map((dt) => (
                        <SelectItem key={dt.id} value={dt.id}>{dt.name} ({dt.typeCode})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Version *</Label>
                  <Input
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="e.g., 1.2.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>File URL *</Label>
                <Input
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="https://storage.example.com/firmware/v1.2.0.bin"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>File Size (bytes) *</Label>
                  <Input
                    type="number"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    placeholder="e.g., 524288"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Checksum (SHA256) *</Label>
                  <Input
                    value={formData.checksum}
                    onChange={(e) => setFormData({ ...formData, checksum: e.target.value })}
                    placeholder="64 character hex string"
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Release Notes</Label>
                <Textarea
                  value={formData.releaseNotes}
                  onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
                  placeholder="What's new in this version..."
                  rows={3}
                />
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isStable}
                    onCheckedChange={(checked) => setFormData({ ...formData, isStable: checked })}
                  />
                  <Label>Stable Release</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isMandatory}
                    onCheckedChange={(checked) => setFormData({ ...formData, isMandatory: checked })}
                  />
                  <Label>Mandatory Update</Label>
                </div>
              </div>

              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Firmware Version
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="firmware" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="firmware" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Firmware Versions
          </TabsTrigger>
          <TabsTrigger value="ota" className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            OTA Updates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="firmware">
          {firmware.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Firmware Versions</h3>
              <p className="text-gray-500 mb-4">Add your first firmware version for OTA updates</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Add Firmware
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
              {firmware.map((fw) => (
                <div key={fw.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">v{fw.version}</p>
                        {fw.isStable && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Stable
                          </Badge>
                        )}
                        {fw.isMandatory && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Mandatory
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{getDeviceTypeName(fw.deviceTypeId)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{formatFileSize(fw.fileSize)}</span>
                    <span className="text-sm text-gray-500">{format(new Date(fw.createdAt), "MMM d, yyyy")}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSelectedFirmware(fw); setOtaDialogOpen(true); }}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Push OTA
                    </Button>
                    <Link href={fw.fileUrl} target="_blank">
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ota">
          {otaUpdates.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Radio className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No OTA Updates</h3>
              <p className="text-gray-500">Push firmware updates to devices from the Firmware Versions tab</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {otaUpdates.map((ota) => (
                    <tr key={ota.id}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{ota.deviceNickname || ota.deviceSerial}</p>
                          <p className="text-xs text-gray-500">{ota.deviceType}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ota.tenantName}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">v{ota.firmwareVersion}</td>
                      <td className="px-4 py-3">{getStatusBadge(ota.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {format(new Date(ota.createdAt), "MMM d, HH:mm")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* OTA Push Dialog */}
      <Dialog open={otaDialogOpen} onOpenChange={(open) => { setOtaDialogOpen(open); if (!open) setSelectedFirmware(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Push OTA Update</DialogTitle>
          </DialogHeader>
          {selectedFirmware && (
            <div className="space-y-4 pt-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Firmware:</strong> v{selectedFirmware.version}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Device Type:</strong> {getDeviceTypeName(selectedFirmware.deviceTypeId)}
                </p>
                {selectedFirmware.releaseNotes && (
                  <p className="text-sm text-blue-700 mt-2">{selectedFirmware.releaseNotes}</p>
                )}
              </div>
              <p className="text-sm text-gray-600">
                This will push the firmware update to all active devices of this type. Devices will download and install the update automatically.
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setOtaDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handlePushOta} disabled={pushing} className="flex-1">
                  {pushing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  <Send className="h-4 w-4 mr-2" />
                  Push to All Devices
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
