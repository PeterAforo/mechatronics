"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Key, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    scopes: "read",
    expiresInDays: "",
  });

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/portal/api-keys");
      if (res.ok) {
        setKeys(await res.json());
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/portal/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          scopes: formData.scopes,
          expiresInDays: formData.expiresInDays ? parseInt(formData.expiresInDays) : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        toast.success("API key created!");
        fetchKeys();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create API key");
      }
    } catch {
      toast.error("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/portal/api-keys/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("API key revoked");
        fetchKeys();
      } else {
        toast.error("Failed to revoke API key");
      }
    } catch {
      toast.error("Failed to revoke API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setNewKey(null);
    setShowKey(false);
    setFormData({ name: "", scopes: "read", expiresInDays: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">API Keys</h1>
          <p className="text-gray-500 mt-1">Manage API keys for programmatic access to your data</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{newKey ? "API Key Created" : "Create API Key"}</DialogTitle>
            </DialogHeader>
            
            {newKey ? (
              <div className="space-y-4 pt-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    ⚠️ Make sure to copy your API key now. You won&apos;t be able to see it again!
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Your API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showKey ? "text" : "password"}
                      value={newKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(newKey)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={closeDialog} className="w-full">Done</Button>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Key Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Production Server"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <Select value={formData.scopes} onValueChange={(v) => setFormData({ ...formData, scopes: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="read,write">Read & Write</SelectItem>
                      <SelectItem value="read,write,delete">Full Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Expiration (Optional)</Label>
                  <Select value={formData.expiresInDays} onValueChange={(v) => setFormData({ ...formData, expiresInDays: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Never expires" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Never expires</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Create API Key
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {keys.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Key className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys</h3>
          <p className="text-gray-500 mb-4">Create an API key to access your data programmatically</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
          {keys.map((key) => (
            <div key={key.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Key className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{key.name}</p>
                  <p className="text-sm text-gray-500 font-mono">{key.keyPrefix}...</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={key.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500"}>
                  {key.isActive ? "Active" : "Revoked"}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {key.scopes}
                </Badge>
                {key.expiresAt && (
                  <span className="text-sm text-gray-500">
                    Expires {format(new Date(key.expiresAt), "MMM d, yyyy")}
                  </span>
                )}
                {key.lastUsedAt && (
                  <span className="text-sm text-gray-500">
                    Last used {format(new Date(key.lastUsedAt), "MMM d")}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(key.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Documentation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">API Usage</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Authentication</p>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100">
              <code>Authorization: Bearer YOUR_API_KEY</code>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Example Request</p>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 overflow-x-auto">
              <code>curl -X GET &quot;https://api.mechatronics.com/v1/devices&quot; \<br />
              &nbsp;&nbsp;-H &quot;Authorization: Bearer mec_xxxxx&quot;</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
