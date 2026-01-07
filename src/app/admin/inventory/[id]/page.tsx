"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";

interface InventoryItem {
  id: string;
  deviceTypeId: string;
  serialNumber: string;
  imei: string | null;
  simNumber: string | null;
  firmwareVersion: string | null;
  status: string;
  notes: string | null;
}

export default function EditInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    serialNumber: "",
    imei: "",
    simNumber: "",
    firmwareVersion: "",
    status: "in_stock",
    notes: "",
  });

  useEffect(() => {
    async function loadItem() {
      const { id } = await params;
      try {
        const res = await fetch(`/api/admin/inventory/${id}`);
        if (!res.ok) {
          toast.error("Inventory item not found");
          router.push("/admin/inventory");
          return;
        }
        const data = await res.json();
        setItem(data);
        setFormData({
          serialNumber: data.serialNumber || "",
          imei: data.imei || "",
          simNumber: data.simNumber || "",
          firmwareVersion: data.firmwareVersion || "",
          status: data.status || "in_stock",
          notes: data.notes || "",
        });
      } catch {
        toast.error("Failed to load inventory item");
        router.push("/admin/inventory");
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [params, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inventory/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update");
      }

      toast.success("Inventory item updated successfully");
      router.push("/admin/inventory");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update inventory item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm("Are you sure you want to delete this inventory item?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/inventory/${item.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Inventory item deleted");
      router.push("/admin/inventory");
    } catch {
      toast.error("Failed to delete inventory item");
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

  if (!item) {
    return null;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin/inventory" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Inventory
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Inventory Item</h1>
          <p className="text-gray-500 mt-1">Update device inventory details</p>
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
        <div className="space-y-2">
          <Label htmlFor="serialNumber">Serial Number *</Label>
          <Input
            id="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            placeholder="e.g., WAT-2024-0001"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="imei">IMEI</Label>
            <Input
              id="imei"
              value={formData.imei}
              onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
              placeholder="Device IMEI"
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firmwareVersion">Firmware Version</Label>
            <Input
              id="firmwareVersion"
              value={formData.firmwareVersion}
              onChange={(e) => setFormData({ ...formData, firmwareVersion: e.target.value })}
              placeholder="e.g., v1.0.0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="installed">Installed</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
          </Button>
          <Link href="/admin/inventory">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </main>
  );
}
