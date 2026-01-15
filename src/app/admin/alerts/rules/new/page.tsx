"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Bell, AlertTriangle } from "lucide-react";

interface DeviceType {
  id: string;
  name: string;
  typeCode: string;
  variables: Array<{
    variableCode: string;
    label: string;
    unit: string | null;
  }>;
}

export default function NewAlertRulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [fetchingTypes, setFetchingTypes] = useState(true);
  
  const [formData, setFormData] = useState({
    ruleName: "",
    deviceTypeId: "",
    variableCode: "",
    operator: "gte",
    threshold1: "",
    threshold2: "",
    severity: "warning",
    messageTemplate: "",
    isActive: true,
  });

  useEffect(() => {
    fetchDeviceTypes();
  }, []);

  const fetchDeviceTypes = async () => {
    try {
      const res = await fetch("/api/admin/device-types");
      const data = await res.json();
      setDeviceTypes(data.deviceTypes || []);
    } catch (error) {
      toast.error("Failed to load device types");
    } finally {
      setFetchingTypes(false);
    }
  };

  const selectedDeviceType = deviceTypes.find(dt => dt.id === formData.deviceTypeId);
  const selectedVariable = selectedDeviceType?.variables.find(v => v.variableCode === formData.variableCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ruleName || !formData.deviceTypeId || !formData.variableCode || !formData.threshold1) {
      toast.error("Please fill in all required fields");
      return;
    }

    if ((formData.operator === "between" || formData.operator === "outside") && !formData.threshold2) {
      toast.error("Please provide both threshold values for range operators");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/alerts/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          threshold1: parseFloat(formData.threshold1),
          threshold2: formData.threshold2 ? parseFloat(formData.threshold2) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create rule");
      }

      toast.success("Alert rule created successfully");
      router.push("/admin/alerts/rules");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create rule");
    } finally {
      setLoading(false);
    }
  };

  const operatorOptions = [
    { value: "lt", label: "Less than (<)" },
    { value: "lte", label: "Less than or equal (≤)" },
    { value: "eq", label: "Equal to (=)" },
    { value: "neq", label: "Not equal to (≠)" },
    { value: "gte", label: "Greater than or equal (≥)" },
    { value: "gt", label: "Greater than (>)" },
    { value: "between", label: "Between (range)" },
    { value: "outside", label: "Outside (range)" },
  ];

  const severityOptions = [
    { value: "info", label: "Info", color: "text-blue-600" },
    { value: "warning", label: "Warning", color: "text-yellow-600" },
    { value: "critical", label: "Critical", color: "text-red-600" },
  ];

  const needsSecondThreshold = formData.operator === "between" || formData.operator === "outside";

  return (
    <main className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/admin/alerts/rules" 
          className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Alert Rules
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 rounded-xl">
            <Bell className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Create Alert Rule</h1>
            <p className="text-gray-500">Configure automated alerts for device thresholds</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rule Details</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ruleName">Rule Name *</Label>
              <Input
                id="ruleName"
                placeholder="e.g., Low Water Level Alert"
                value={formData.ruleName}
                onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Device Type *</Label>
                <Select 
                  value={formData.deviceTypeId} 
                  onValueChange={(value) => setFormData({ ...formData, deviceTypeId: value, variableCode: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={fetchingTypes ? "Loading..." : "Select device type"} />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map((dt) => (
                      <SelectItem key={dt.id} value={dt.id}>
                        {dt.name} ({dt.typeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Variable *</Label>
                <Select 
                  value={formData.variableCode} 
                  onValueChange={(value) => setFormData({ ...formData, variableCode: value })}
                  disabled={!formData.deviceTypeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDeviceType?.variables.map((v) => (
                      <SelectItem key={v.variableCode} value={v.variableCode}>
                        {v.label} ({v.variableCode}) {v.unit && `- ${v.unit}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Condition */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trigger Condition</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Operator *</Label>
              <Select 
                value={formData.operator} 
                onValueChange={(value) => setFormData({ ...formData, operator: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operatorOptions.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="threshold1">
                  {needsSecondThreshold ? "Lower Threshold *" : "Threshold Value *"}
                </Label>
                <div className="relative">
                  <Input
                    id="threshold1"
                    type="number"
                    step="any"
                    placeholder="e.g., 20"
                    value={formData.threshold1}
                    onChange={(e) => setFormData({ ...formData, threshold1: e.target.value })}
                    required
                  />
                  {selectedVariable?.unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      {selectedVariable.unit}
                    </span>
                  )}
                </div>
              </div>

              {needsSecondThreshold && (
                <div className="space-y-2">
                  <Label htmlFor="threshold2">Upper Threshold *</Label>
                  <div className="relative">
                    <Input
                      id="threshold2"
                      type="number"
                      step="any"
                      placeholder="e.g., 80"
                      value={formData.threshold2}
                      onChange={(e) => setFormData({ ...formData, threshold2: e.target.value })}
                      required
                    />
                    {selectedVariable?.unit && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        {selectedVariable.unit}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {formData.variableCode && formData.threshold1 && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Condition Preview:</span>{" "}
                  Alert when <span className="font-mono bg-white px-1 rounded">{formData.variableCode}</span>{" "}
                  is {operatorOptions.find(o => o.value === formData.operator)?.label.toLowerCase()}{" "}
                  <span className="font-mono bg-white px-1 rounded">{formData.threshold1}</span>
                  {needsSecondThreshold && formData.threshold2 && (
                    <> and <span className="font-mono bg-white px-1 rounded">{formData.threshold2}</span></>
                  )}
                  {selectedVariable?.unit && ` ${selectedVariable.unit}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Severity & Message */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alert Settings</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Severity *</Label>
              <Select 
                value={formData.severity} 
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((sev) => (
                    <SelectItem key={sev.value} value={sev.value}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${sev.color}`} />
                        {sev.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageTemplate">Alert Message Template *</Label>
              <Textarea
                id="messageTemplate"
                placeholder="e.g., Water level is critically low at {value}%. Please check the tank immediately."
                value={formData.messageTemplate}
                onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Use {"{value}"} to include the actual reading value in the message
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Enable Rule</p>
                <p className="text-sm text-gray-500">Rule will start monitoring immediately when enabled</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/alerts/rules">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button 
            type="submit" 
            className="bg-purple-600 hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Alert Rule"
            )}
          </Button>
        </div>
      </form>
    </main>
  );
}
