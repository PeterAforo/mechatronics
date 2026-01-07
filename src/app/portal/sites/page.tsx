"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, Plus, Building2, ChevronRight, Loader2, Navigation } from "lucide-react";
import { 
  getRegionNames, 
  getConstituenciesByRegion, 
  getDistrictsByConstituency 
} from "@/lib/ghana-locations";

interface Site {
  id: string;
  siteName: string;
  address: string | null;
  city: string | null;
  country: string | null;
  status: string;
  zones: { id: string; zoneName: string }[];
}

export default function SitesPage() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    siteName: "",
    address: "",
    region: "",
    constituency: "",
    district: "",
    city: "",
    country: "Ghana",
    latitude: "",
    longitude: "",
  });

  // Cascading dropdown options
  const regions = getRegionNames();
  const constituencies = formData.region ? getConstituenciesByRegion(formData.region) : [];
  const districts = formData.region && formData.constituency 
    ? getDistrictsByConstituency(formData.region, formData.constituency) 
    : [];

  useEffect(() => {
    fetchSites();
  }, []);

  // Reset dependent fields when parent changes
  useEffect(() => {
    if (formData.region) {
      setFormData(prev => ({ ...prev, constituency: "", district: "" }));
    }
  }, [formData.region]);

  useEffect(() => {
    if (formData.constituency) {
      setFormData(prev => ({ ...prev, district: "" }));
    }
  }, [formData.constituency]);

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/portal/sites");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSites(data);
    } catch {
      toast.error("Failed to load sites");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    // Check if we're on HTTPS or localhost
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
    
    if (!isSecure) {
      toast.error("Geolocation requires HTTPS. Please use a secure connection.");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        toast.success("Location captured successfully");
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        
        // Provide specific error messages based on error code
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location access denied. Please allow location access in your browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information unavailable. Please try again or enter coordinates manually.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out. Please try again.");
            break;
          default:
            toast.error("Unable to get location. You can enter coordinates manually.");
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000,
        maximumAge: 0 
      }
    );
  };

  const handleCreate = async () => {
    if (!formData.siteName.trim()) {
      toast.error("Site name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/portal/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create");

      toast.success("Site created successfully");
      setModalOpen(false);
      setFormData({ 
        siteName: "", 
        address: "", 
        region: "",
        constituency: "",
        district: "",
        city: "", 
        country: "Ghana",
        latitude: "",
        longitude: "",
      });
      fetchSites();
      router.refresh();
    } catch {
      toast.error("Failed to create site");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#f74780]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sites</h1>
          <p className="text-gray-500">Manage your locations and zones</p>
        </div>
        <Button 
          className="bg-[#f74780] hover:bg-[#e03a6f]"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Site
        </Button>
      </div>

      {sites.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sites yet</h3>
          <p className="text-gray-500 mb-4">Create sites to organize your devices by location</p>
          <Button 
            className="bg-[#f74780] hover:bg-[#e03a6f]"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Site
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <div 
              key={site.id} 
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
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
              <h3 className="font-semibold text-gray-900 mb-1">{site.siteName}</h3>
              <p className="text-sm text-gray-500 mb-4">{site.address || "No address"}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-gray-500">
                  <span>{site.zones.length} zones</span>
                </div>
                <Link href={`/portal/sites/${site.id}`}>
                  <Button variant="ghost" size="sm" className="text-[#f74780]">
                    Manage
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Site Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Site</DialogTitle>
            <DialogDescription>
              Add a new location to organize your devices
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Site Name */}
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name *</Label>
              <Input
                id="siteName"
                placeholder="e.g., Main Office, Warehouse A"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Country (fixed to Ghana) */}
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value="Ghana" disabled className="bg-gray-50" />
            </div>

            {/* Region */}
            <div className="space-y-2">
              <Label>Region *</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => setFormData({ ...formData, region: value, constituency: "", district: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Constituency */}
            <div className="space-y-2">
              <Label>Constituency</Label>
              <Select
                value={formData.constituency}
                onValueChange={(value) => setFormData({ ...formData, constituency: value, district: "" })}
                disabled={!formData.region}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.region ? "Select constituency" : "Select region first"} />
                </SelectTrigger>
                <SelectContent>
                  {constituencies.map((constituency) => (
                    <SelectItem key={constituency} value={constituency}>
                      {constituency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District */}
            <div className="space-y-2">
              <Label>District</Label>
              <Select
                value={formData.district}
                onValueChange={(value) => setFormData({ ...formData, district: value })}
                disabled={!formData.constituency}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.constituency ? "Select district" : "Select constituency first"} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City / Town</Label>
              <Input
                id="city"
                placeholder="City or town name"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            {/* GPS Coordinates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>GPS Coordinates</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                >
                  {gettingLocation ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Getting...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-3 w-3 mr-1" />
                      Get My Location
                    </>
                  )}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="Latitude"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Longitude"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>
              </div>
              {formData.latitude && formData.longitude && (
                <p className="text-xs text-gray-500">
                  📍 {formData.latitude}, {formData.longitude}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={saving}
              className="bg-[#f74780] hover:bg-[#e03a6f]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Site"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
