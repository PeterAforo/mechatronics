"use client";

// Alert Rule Detail/Edit Page
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Bell, Trash2, Save } from "lucide-react";

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

interface AlertRule {
  id: string;
  ruleName: string;
  deviceTypeId: string;
  variableCode: string;
  operator: string;
  threshold1: number;
  threshold2: number | null;
  severity: string;
  messageTemplate: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AlertRuleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [rule, setRule] = useState<AlertRule | null>(null);

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
    fetchData();
  }, [ruleId]);

  const fetchData = async () => {
    try {
      const [ruleRes, typesRes] = await Promise.all([
        fetch(`/api/admin/alerts/rules/${ruleId}`),
        fetch("/api/admin/device-types"),
      ]);

      if (!ruleRes.ok) {
        throw new Error("Rule not found");
      }

      const ruleData = await ruleRes.json();
      const typesData = await typesRes.json();

      setRule(ruleData.rule);
      setDeviceTypes(typesData.deviceTypes || []);

      setFormData({
        ruleName: ruleData.rule.ruleName,
        deviceTypeId: ruleData.rule.deviceTypeId,
        variableCode: ruleData.rule.variableCode,
        operator: ruleData.rule.operator,
        threshold1: ruleData.rule.threshold1.toString(),
        threshold2: ruleData.rule.threshold2?.toString() || "",
        severity: ruleData.rule.severity,
        messageTemplate: ruleData.rule.messageTemplate || "",
        isActive: ruleData.rule.isActive,
      });
    } catch (error) {
      toast.error("Failed to load alert rule");
      router.push("/admin/alerts/rules");
    } finally {
      setLoading(false);
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

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/alerts/rules/${ruleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          threshold1: parseFloat(formData.threshold1),
          threshold2: formData.threshold2 ? parseFloat(formData.threshold2) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update rule");
      }

      toast.success("Alert rule updated successfully");
      router.push("/admin/alerts/rules");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update rule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this alert rule?")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/alerts/rules/${ruleId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete rule");
      }

      toast.success("Alert rule deleted");
      router.push("/admin/alerts/rules");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete rule");
    } finally {
      setDeleting(false);
    }
  };

  const operators = [
    { value: "lt", label: "Less than (<)" },
    { value: "lte", label: "Less than or equal (≤)" },
    { value: "eq", label: "Equal to (=)" },
    { value: "neq", label: "Not equal to (≠)" },
    { value: "gte", label: "Greater than or equal (≥)" },
    { value: "gt", label: "Greater than (>)" },
    { value: "between", label: "Between (inclusive)" },
    { value: "outside", label: "Outside range" },
  ];

  const severities = [
    { value: "info", label: "Info", color: "bg-blue-100 text-blue-700" },
    { value: "warning", label: "Warning", color: "bg-yellow-100 text-yellow-700" },
    { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
  ];

  if (loading) {
    return (
      <main className="p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-6 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/alerts/rules"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Alert Rules
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Bell className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Edit Alert Rule</h1>
              <p className="text-gray-500">Modify alert rule configuration</p>
            </div>
          </div>
          <Badge variant="outline" className={formData.isActive ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"}>
            {formData.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h2 className="font-semibold text-gray-900">Rule Details</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="ruleName">Rule Name *</Label>
              <Input
                id="ruleName"
                value={formData.ruleName}
                onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                placeholder="e.g., High Temperature Alert"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Device Type *</Label>
                <Select
                  value={formData.deviceTypeId}
                  onValueChange={(value) => setFormData({ ...formData, deviceTypeId: value, variableCode: "" })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select device type" />
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

              <div>
                <Label>Variable *</Label>
                <Select
                  value={formData.variableCode}
                  onValueChange={(value) => setFormData({ ...formData, variableCode: value })}
                  disabled={!formData.deviceTypeId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDeviceType?.variables.map((v) => (
                      <SelectItem key={v.variableCode} value={v.variableCode}>
                        {v.label} {v.unit ? `(${v.unit})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h2 className="font-semibold text-gray-900">Threshold Configuration</h2>

          <div className="space-y-4">
            <div>
              <Label>Operator *</Label>
              <Select
                value={formData.operator}
                onValueChange={(value) => setFormData({ ...formData, operator: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="threshold1">
                  {formData.operator === "between" || formData.operator === "outside" ? "Min Value *" : "Threshold Value *"}
                </Label>
                <Input
                  id="threshold1"
                  type="number"
                  step="any"
                  value={formData.threshold1}
                  onChange={(e) => setFormData({ ...formData, threshold1: e.target.value })}
                  placeholder="Enter value"
                  className="mt-1"
                />
                {selectedVariable?.unit && (
                  <p className="text-xs text-gray-500 mt-1">Unit: {selectedVariable.unit}</p>
                )}
              </div>

              {(formData.operator === "between" || formData.operator === "outside") && (
                <div>
                  <Label htmlFor="threshold2">Max Value *</Label>
                  <Input
                    id="threshold2"
                    type="number"
                    step="any"
                    value={formData.threshold2}
                    onChange={(e) => setFormData({ ...formData, threshold2: e.target.value })}
                    placeholder="Enter value"
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Severity *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severities.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className={`px-2 py-0.5 rounded text-sm ${s.color}`}>{s.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h2 className="font-semibold text-gray-900">Notification Settings</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="messageTemplate">Custom Message Template</Label>
              <Textarea
                id="messageTemplate"
                value={formData.messageTemplate}
                onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                placeholder="e.g., Temperature reading of {value} exceeds safe limit of {threshold}"
                className="mt-1"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {"{value}"}, {"{threshold}"}, {"{device}"}, {"{variable}"}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Rule Active</p>
                <p className="text-sm text-gray-500">Enable or disable this alert rule</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-2"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete Rule
          </Button>

          <div className="flex gap-3">
            <Link href="/admin/alerts/rules">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
