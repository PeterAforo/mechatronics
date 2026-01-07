"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";

interface DeviceSettings {
  id: string;
  nickname: string;
  serialNumber: string;
  productName: string;
}

export default function DeviceSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [device, setDevice] = useState<DeviceSettings | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    async function loadParams() {
      const { id } = await params;
      setDeviceId(id);
      fetchDevice(id);
    }
    loadParams();
  }, [params]);

  const fetchDevice = async (id: string) => {
    try {
      const res = await fetch(`/api/portal/devices/${id}`);
      if (!res.ok) throw new Error("Failed to fetch device");
      const data = await res.json();
      setDevice(data);
      setNickname(data.nickname || "");
    } catch {
      toast.error("Failed to load device");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/portal/devices/${deviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Settings saved");
      router.push(`/portal/devices/${deviceId}`);
      router.refresh();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#f74780]" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Device not found</p>
          <Link href="/portal">
            <Button>Back to Portal</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link 
          href={`/portal/devices/${deviceId}`} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Device</span>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Device Settings</h1>
        <p className="text-gray-500">{device.serialNumber}</p>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Customize your device settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nickname">Device Name</Label>
              <Input
                id="nickname"
                placeholder={device.productName || "My Device"}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Give your device a friendly name to easily identify it
              </p>
            </div>

            <div className="space-y-2">
              <Label>Serial Number</Label>
              <Input value={device.serialNumber} disabled className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label>Product</Label>
              <Input value={device.productName} disabled className="bg-gray-50" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#f74780] hover:bg-[#e03a6f]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Link href={`/portal/devices/${deviceId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
    </div>
  );
}
