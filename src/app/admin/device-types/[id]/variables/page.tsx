"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Trash2, GripVertical } from "lucide-react";

interface Variable {
  id?: string;
  variableCode: string;
  label: string;
  unit: string;
  description: string;
  minValue: string;
  maxValue: string;
  displayWidget: string;
  displayOrder: number;
  isAlertable: boolean;
  isRequired: boolean;
  isNew?: boolean;
}

interface DeviceType {
  id: string;
  typeCode: string;
  name: string;
}

export default function DeviceTypeVariablesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
  const [variables, setVariables] = useState<Variable[]>([]);

  useEffect(() => {
    async function load() {
      const { id } = await params;
      try {
        const [dtRes, varsRes] = await Promise.all([
          fetch(`/api/admin/device-types/${id}`),
          fetch(`/api/admin/device-types/${id}/variables`),
        ]);
        
        if (!dtRes.ok) {
          toast.error("Device type not found");
          router.push("/admin/device-types");
          return;
        }
        
        const dt = await dtRes.json();
        setDeviceType(dt);
        
        if (varsRes.ok) {
          const vars = await varsRes.json();
          setVariables(vars.map((v: Variable) => ({ ...v, isNew: false })));
        }
      } catch {
        toast.error("Failed to load");
        router.push("/admin/device-types");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params, router]);

  const addVariable = () => {
    setVariables([
      ...variables,
      {
        variableCode: "",
        label: "",
        unit: "",
        description: "",
        minValue: "",
        maxValue: "",
        displayWidget: "numeric",
        displayOrder: variables.length,
        isAlertable: true,
        isRequired: false,
        isNew: true,
      },
    ]);
  };

  const updateVariable = (index: number, field: keyof Variable, value: string | number | boolean) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: value };
    setVariables(updated);
  };

  const removeVariable = async (index: number) => {
    const variable = variables[index];
    if (variable.id && !variable.isNew) {
      if (!confirm("Delete this variable?")) return;
      try {
        await fetch(`/api/admin/device-types/${deviceType?.id}/variables/${variable.id}`, {
          method: "DELETE",
        });
        toast.success("Variable deleted");
      } catch {
        toast.error("Failed to delete");
        return;
      }
    }
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!deviceType) return;
    setSaving(true);
    
    try {
      const res = await fetch(`/api/admin/device-types/${deviceType.id}/variables`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables }),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      toast.success("Variables saved successfully");
      router.push(`/admin/device-types/${deviceType.id}`);
    } catch {
      toast.error("Failed to save variables");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </main>
    );
  }

  if (!deviceType) return null;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/admin/device-types/${deviceType.id}`} className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to {deviceType.name}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Device Variables</h1>
          <p className="text-gray-500 mt-1">Configure telemetry variables for {deviceType.typeCode}</p>
        </div>
        <Button onClick={addVariable}>
          <Plus className="h-4 w-4 mr-2" />
          Add Variable
        </Button>
      </div>

      <div className="space-y-4">
        {variables.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No variables configured yet</p>
            <Button onClick={addVariable}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Variable
            </Button>
          </div>
        ) : (
          variables.map((variable, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start gap-4">
                <div className="pt-2 text-gray-400 cursor-move">
                  <GripVertical className="h-5 w-5" />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Code *</Label>
                    <Input
                      value={variable.variableCode}
                      onChange={(e) => updateVariable(index, "variableCode", e.target.value.toUpperCase())}
                      placeholder="e.g., W, T, K"
                      className="font-mono"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Label *</Label>
                    <Input
                      value={variable.label}
                      onChange={(e) => updateVariable(index, "label", e.target.value)}
                      placeholder="e.g., Water Level"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      value={variable.unit}
                      onChange={(e) => updateVariable(index, "unit", e.target.value)}
                      placeholder="e.g., %, °C, kW"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Widget</Label>
                    <Select
                      value={variable.displayWidget}
                      onValueChange={(value) => updateVariable(index, "displayWidget", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="numeric">Numeric</SelectItem>
                        <SelectItem value="gauge">Gauge</SelectItem>
                        <SelectItem value="tank_fill">Tank Fill</SelectItem>
                        <SelectItem value="chart_line">Line Chart</SelectItem>
                        <SelectItem value="chart_bar">Bar Chart</SelectItem>
                        <SelectItem value="status_badge">Status Badge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Min Value</Label>
                    <Input
                      type="number"
                      value={variable.minValue}
                      onChange={(e) => updateVariable(index, "minValue", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Max Value</Label>
                    <Input
                      type="number"
                      value={variable.maxValue}
                      onChange={(e) => updateVariable(index, "maxValue", e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 pt-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={variable.isAlertable}
                        onCheckedChange={(checked) => updateVariable(index, "isAlertable", checked)}
                      />
                      <Label className="text-sm">Alertable</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={variable.isRequired}
                        onCheckedChange={(checked) => updateVariable(index, "isRequired", checked)}
                      />
                      <Label className="text-sm">Required</Label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end pt-6">
                    {variable.isNew && (
                      <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 border-blue-200">New</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeVariable(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {variables.length > 0 && (
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save All Variables
          </Button>
          <Link href={`/admin/device-types/${deviceType.id}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      )}
    </main>
  );
}
