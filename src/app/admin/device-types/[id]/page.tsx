"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";

interface DeviceType {
  id: string;
  typeCode: string;
  name: string;
  description: string | null;
  category: string;
  manufacturer: string | null;
  communicationProtocol: string;
  isActive: boolean;
}

export default function EditDeviceTypePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
  const [formData, setFormData] = useState({
    typeCode: "",
    name: "",
    description: "",
    category: "other",
    manufacturer: "",
    communicationProtocol: "sms",
    isActive: true,
  });

  useEffect(() => {
    async function loadDeviceType() {
      const { id } = await params;
      try {
        const res = await fetch(`/api/admin/device-types/${id}`);
        if (!res.ok) {
          toast.error("Device type not found");
          router.push("/admin/device-types");
          return;
        }
        const data = await res.json();
        setDeviceType(data);
        setFormData({
          typeCode: data.typeCode || "",
          name: data.name || "",
          description: data.description || "",
          category: data.category || "other",
          manufacturer: data.manufacturer || "",
          communicationProtocol: data.communicationProtocol || "sms",
          isActive: data.isActive ?? true,
        });
      } catch {
        toast.error("Failed to load device type");
        router.push("/admin/device-types");
      } finally {
        setLoading(false);
      }
    }
    loadDeviceType();
  }, [params, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceType) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/device-types/${deviceType.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update");
      }

      toast.success("Device type updated successfully");
      router.push("/admin/device-types");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update device type");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deviceType) return;
    if (!confirm("Are you sure you want to delete this device type?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/device-types/${deviceType.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Device type deleted");
      router.push("/admin/device-types");
    } catch {
      toast.error("Failed to delete device type");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </main>
    );
  }

  if (!deviceType) {
    return null;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin/device-types" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Device Types
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Device Type</h1>
          <p className="text-gray-500 mt-1">Update device type details</p>
        </div>
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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="typeCode">Type Code *</Label>
            <Input
              id="typeCode"
              value={formData.typeCode}
              onChange={(e) => setFormData({ ...formData, typeCode: e.target.value })}
              placeholder="e.g., WAT100"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Water Level Monitor"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the device type..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="power">Power</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              placeholder="e.g., Mechatronics"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="protocol">Communication Protocol</Label>
          <Select
            value={formData.communicationProtocol}
            onValueChange={(value) => setFormData({ ...formData, communicationProtocol: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="http">HTTP</SelectItem>
              <SelectItem value="mqtt">MQTT</SelectItem>
              <SelectItem value="lora">LoRa</SelectItem>
              <SelectItem value="zigbee">Zigbee</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <Label htmlFor="isActive">Active</Label>
            <p className="text-sm text-gray-500">Enable this device type for use</p>
          </div>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
          </Button>
          <Link href="/admin/device-types">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </main>
  );
}
