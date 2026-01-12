"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Bell, Trash2, Edit, AlertTriangle, AlertCircle, Info } from "lucide-react";

interface AlertRule {
  id: string;
  deviceTypeId: string;
  variableCode: string;
  ruleName: string;
  operator: string;
  threshold1: number;
  threshold2: number | null;
  severity: string;
  messageTemplate: string;
  isActive: boolean;
  createdAt: string;
}

interface DeviceTypeVariable {
  variableCode: string;
  label: string;
  unit: string | null;
}

interface DeviceType {
  id: string;
  typeCode: string;
  name: string;
  category: string;
  variables: DeviceTypeVariable[];
}

export default function AlertRulesPage() {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  
  const [formData, setFormData] = useState({
    deviceTypeId: "",
    variableCode: "",
    ruleName: "",
    operator: "lte",
    threshold1: "",
    threshold2: "",
    severity: "warning",
    messageTemplate: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rulesRes, typesRes] = await Promise.all([
        fetch("/api/portal/alert-rules"),
        fetch("/api/portal/device-types"),
      ]);
      
      if (rulesRes.ok) {
        setRules(await rulesRes.json());
      }
      if (typesRes.ok) {
        const types = await typesRes.json();
        setDeviceTypes(types);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get variables for selected device type
  const selectedDeviceType = deviceTypes.find(dt => dt.id === formData.deviceTypeId);
  const availableVariables = selectedDeviceType?.variables || [];

  const handleSave = async () => {
    if (!formData.deviceTypeId || !formData.variableCode || !formData.ruleName || !formData.threshold1) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const url = editingRule 
        ? `/api/portal/alert-rules/${editingRule.id}`
        : "/api/portal/alert-rules";
      
      const res = await fetch(url, {
        method: editingRule ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          threshold1: parseFloat(formData.threshold1),
          threshold2: formData.threshold2 ? parseFloat(formData.threshold2) : null,
        }),
      });

      if (res.ok) {
        toast.success(editingRule ? "Rule updated!" : "Rule created!");
        setDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save rule");
      }
    } catch {
      toast.error("Failed to save rule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      const res = await fetch(`/api/portal/alert-rules/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Rule deleted");
        fetchData();
      } else {
        toast.error("Failed to delete rule");
      }
    } catch {
      toast.error("Failed to delete rule");
    }
  };

  const handleToggle = async (rule: AlertRule) => {
    try {
      const res = await fetch(`/api/portal/alert-rules/${rule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });

      if (res.ok) {
        toast.success(rule.isActive ? "Rule disabled" : "Rule enabled");
        fetchData();
      }
    } catch {
      toast.error("Failed to update rule");
    }
  };

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setFormData({
      deviceTypeId: rule.deviceTypeId,
      variableCode: rule.variableCode,
      ruleName: rule.ruleName,
      operator: rule.operator,
      threshold1: rule.threshold1.toString(),
      threshold2: rule.threshold2?.toString() || "",
      severity: rule.severity,
      messageTemplate: rule.messageTemplate,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingRule(null);
    setFormData({
      deviceTypeId: "",
      variableCode: "",
      ruleName: "",
      operator: "lte",
      threshold1: "",
      threshold2: "",
      severity: "warning",
      messageTemplate: "",
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getOperatorLabel = (op: string) => {
    const labels: Record<string, string> = {
      lt: "Less than",
      lte: "Less than or equal",
      eq: "Equal to",
      neq: "Not equal to",
      gte: "Greater than or equal",
      gt: "Greater than",
      between: "Between",
      outside: "Outside range",
    };
    return labels[op] || op;
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
          <h1 className="text-2xl font-semibold text-gray-900">Alert Rules</h1>
          <p className="text-gray-500 mt-1">Configure custom alert thresholds for your devices</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRule ? "Edit Alert Rule" : "Create Alert Rule"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Device Type *</Label>
                  <Select 
                    value={formData.deviceTypeId} 
                    onValueChange={(v) => setFormData({ ...formData, deviceTypeId: v, variableCode: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.filter(dt => dt.id).map((dt) => (
                        <SelectItem key={dt.id} value={dt.id}>{dt.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Variable Code *</Label>
                  <Select 
                    value={formData.variableCode} 
                    onValueChange={(v) => setFormData({ ...formData, variableCode: v })}
                    disabled={!formData.deviceTypeId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.deviceTypeId ? "Select variable" : "Select device type first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVariables.filter(v => v.variableCode).map((v) => (
                        <SelectItem key={v.variableCode} value={v.variableCode}>
                          {v.label} ({v.variableCode}){v.unit ? ` - ${v.unit}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rule Name *</Label>
                <Input
                  value={formData.ruleName}
                  onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                  placeholder="e.g., Low Water Level Alert"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Operator *</Label>
                  <Select value={formData.operator} onValueChange={(v) => setFormData({ ...formData, operator: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lt">Less than</SelectItem>
                      <SelectItem value="lte">Less than or equal</SelectItem>
                      <SelectItem value="eq">Equal to</SelectItem>
                      <SelectItem value="neq">Not equal to</SelectItem>
                      <SelectItem value="gte">Greater than or equal</SelectItem>
                      <SelectItem value="gt">Greater than</SelectItem>
                      <SelectItem value="between">Between</SelectItem>
                      <SelectItem value="outside">Outside range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severity *</Label>
                  <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Threshold 1 *</Label>
                  <Input
                    type="number"
                    value={formData.threshold1}
                    onChange={(e) => setFormData({ ...formData, threshold1: e.target.value })}
                    placeholder="e.g., 20"
                  />
                </div>
                {(formData.operator === "between" || formData.operator === "outside") && (
                  <div className="space-y-2">
                    <Label>Threshold 2 *</Label>
                    <Input
                      type="number"
                      value={formData.threshold2}
                      onChange={(e) => setFormData({ ...formData, threshold2: e.target.value })}
                      placeholder="e.g., 80"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Message Template</Label>
                <Input
                  value={formData.messageTemplate}
                  onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                  placeholder="e.g., Water level is {value}%"
                />
                <p className="text-xs text-gray-500">Use {"{value}"} for the actual reading</p>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingRule ? "Update Rule" : "Create Rule"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Alert Rules</h3>
          <p className="text-gray-500 mb-4">Create your first alert rule to get notified when thresholds are breached</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
          {rules.map((rule) => (
            <div key={rule.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getSeverityIcon(rule.severity)}
                <div>
                  <p className="font-medium text-gray-900">{rule.ruleName}</p>
                  <p className="text-sm text-gray-500">
                    {rule.variableCode} {getOperatorLabel(rule.operator)} {rule.threshold1}
                    {rule.threshold2 && ` - ${rule.threshold2}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={getSeverityBadge(rule.severity)}>
                  {rule.severity}
                </Badge>
                <Switch
                  checked={rule.isActive}
                  onCheckedChange={() => handleToggle(rule)}
                />
                <Button variant="ghost" size="sm" onClick={() => handleEdit(rule)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(rule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
