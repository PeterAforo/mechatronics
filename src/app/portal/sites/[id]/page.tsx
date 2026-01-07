"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  ArrowLeft, Building2, MapPin, Cpu, Plus, Trash2, 
  Edit2, Loader2, Save, MoreVertical 
} from "lucide-react";

interface Zone {
  id: string;
  zoneName: string;
  description: string | null;
}

interface Site {
  id: string;
  siteName: string;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  zones: Zone[];
}

export default function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [savingZone, setSavingZone] = useState(false);
  
  const [editData, setEditData] = useState({
    siteName: "",
    address: "",
  });

  const [newZone, setNewZone] = useState({
    zoneName: "",
    description: "",
  });

  useEffect(() => {
    fetchSite();
  }, [id]);

  const fetchSite = async () => {
    try {
      const res = await fetch(`/api/portal/sites/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSite(data);
      setEditData({
        siteName: data.siteName,
        address: data.address || "",
      });
    } catch {
      toast.error("Failed to load site");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editData.siteName.trim()) {
      toast.error("Site name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/portal/sites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Site updated successfully");
      setEditMode(false);
      fetchSite();
    } catch {
      toast.error("Failed to update site");
    } finally {
      setSaving(false);
    }
  };

  const handleAddZone = async () => {
    if (!newZone.zoneName.trim()) {
      toast.error("Zone name is required");
      return;
    }

    setSavingZone(true);
    try {
      const res = await fetch(`/api/portal/sites/${id}/zones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newZone),
      });

      if (!res.ok) throw new Error("Failed to create zone");

      toast.success("Zone created successfully");
      setZoneModalOpen(false);
      setNewZone({ zoneName: "", description: "" });
      fetchSite();
    } catch {
      toast.error("Failed to create zone");
    } finally {
      setSavingZone(false);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm("Are you sure you want to delete this zone?")) return;

    try {
      const res = await fetch(`/api/portal/sites/${id}/zones/${zoneId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Zone deleted");
      fetchSite();
    } catch {
      toast.error("Failed to delete zone");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#f74780]" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Site not found</p>
          <Link href="/portal/sites">
            <Button>Back to Sites</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/portal/sites" 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Sites</span>
        </Link>
        {!editMode && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setEditMode(true)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit Site
          </Button>
        )}
      </div>

      {/* Site Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            {editMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input
                    value={editData.siteName}
                    onChange={(e) => setEditData({ ...editData, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
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
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-semibold text-gray-900">{site.siteName}</h1>
                  <Badge 
                    variant="outline"
                    className={site.status === "active" 
                      ? "border-green-200 bg-green-50 text-green-700" 
                      : "border-gray-200 text-gray-600"
                    }
                  >
                    {site.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{site.address || "No address"}</span>
                </div>
                {site.latitude && site.longitude && (
                  <p className="text-sm text-gray-400 mt-1">
                    📍 {site.latitude}, {site.longitude}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Zones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Zones</CardTitle>
              <CardDescription>Organize devices within this site by zones</CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => setZoneModalOpen(true)}
              className="bg-[#f74780] hover:bg-[#e03a6f]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {site.zones.length === 0 ? (
            <div className="text-center py-8">
              <Cpu className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">No zones yet</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setZoneModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Zone
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {site.zones.map((zone) => (
                <div 
                  key={zone.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{zone.zoneName}</p>
                    {zone.description && (
                      <p className="text-sm text-gray-500">{zone.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteZone(zone.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Zone Modal */}
      <Dialog open={zoneModalOpen} onOpenChange={setZoneModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Zone</DialogTitle>
            <DialogDescription>
              Create a zone to organize devices within {site.siteName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="zoneName">Zone Name *</Label>
              <Input
                id="zoneName"
                placeholder="e.g., Ground Floor, Server Room, Warehouse A"
                value={newZone.zoneName}
                onChange={(e) => setNewZone({ ...newZone, zoneName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoneDesc">Description</Label>
              <Input
                id="zoneDesc"
                placeholder="Optional description"
                value={newZone.description}
                onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setZoneModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddZone} 
              disabled={savingZone}
              className="bg-[#f74780] hover:bg-[#e03a6f]"
            >
              {savingZone ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Zone"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
