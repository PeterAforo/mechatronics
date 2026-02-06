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
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

interface DeviceType {
  id: string;
  name: string;
  typeCode: string;
}

export default function NewInventoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [formData, setFormData] = useState({
    deviceTypeId: "",
    quantity: 1,
    serialNumber: "",
    imei: "",
    simNumber: "",
    firmwareVersion: "",
    notes: "",
  });

  useEffect(() => {
    const fetchDeviceTypes = async () => {
      const res = await fetch("/api/admin/device-types");
      if (res.ok) {
        const data = await res.json();
        // API returns { deviceTypes: [...] }, extract the array
        setDeviceTypes(Array.isArray(data) ? data : (data.deviceTypes || []));
      }
    };
    fetchDeviceTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          autoGenerate,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add device");
      }

      const count = formData.quantity;
      toast.success(`${count} device${count > 1 ? "s" : ""} added to inventory`);
      router.push("/admin/inventory");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add device");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/inventory" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Add Device to Inventory</h1>
        <p className="text-gray-500 mt-1">Register new device units</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Auto-generate toggle */}
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Auto-generate identifiers</p>
              <p className="text-sm text-gray-500">Automatically generate serial number, IMEI, and SIM number</p>
            </div>
          </div>
          <Switch
            checked={autoGenerate}
            onCheckedChange={setAutoGenerate}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deviceTypeId">Device Type *</Label>
            <Select value={formData.deviceTypeId} onValueChange={(v) => setFormData({ ...formData, deviceTypeId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name} ({type.typeCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {autoGenerate ? (
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={100}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              />
              <p className="text-xs text-gray-500">Create multiple devices at once</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="e.g., WAT-2026-0001"
                required={!autoGenerate}
              />
            </div>
          )}
        </div>

        {!autoGenerate && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imei">IMEI</Label>
              <Input
                id="imei"
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                placeholder="Device IMEI number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="simNumber">SIM Number</Label>
              <Input
                id="simNumber"
                value={formData.simNumber}
                onChange={(e) => setFormData({ ...formData, simNumber: e.target.value })}
                placeholder="SIM card number"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="firmwareVersion">Firmware Version</Label>
          <Input
            id="firmwareVersion"
            value={formData.firmwareVersion}
            onChange={(e) => setFormData({ ...formData, firmwareVersion: e.target.value })}
            placeholder="e.g., v1.0.0 (leave empty to use device type default)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about this device..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link href="/admin/inventory">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isLoading || !formData.deviceTypeId}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              `Add ${formData.quantity > 1 ? formData.quantity + " Devices" : "to Inventory"}`
            )}
          </Button>
        </div>
      </form>
    </main>
  );
}
