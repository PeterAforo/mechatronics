"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Download, FileText, BarChart3, AlertTriangle, Cpu, DollarSign, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";

interface VariableStats {
  count: number;
  min: number;
  max: number;
  avg: number;
}

interface ReportData {
  type: string;
  totalReadings?: number;
  totalAlerts?: number;
  totalDevices?: number;
  totalRevenue?: number;
  byVariable?: Record<string, VariableStats>;
  bySeverity?: Record<string, number>;
  byStatus?: Record<string, number>;
  byType?: Record<string, number>;
  alerts?: Array<{ id: string; title: string; severity: string; createdAt: string }>;
  devices?: Array<{ id: string; name: string; status: string; type: string; lastSeen: string | null }>;
  [key: string]: unknown;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("telemetry_summary");
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        startDate,
        endDate,
      });
      
      const res = await fetch(`/api/portal/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      } else {
        toast.error("Failed to generate report");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleGenerate = () => {
    fetchReport();
  };

  const handleExport = async (format: string) => {
    const params = new URLSearchParams({
      type: reportType === "telemetry_summary" ? "telemetry" : 
            reportType === "alert_history" ? "alerts" :
            reportType === "device_status" ? "devices" :
            reportType === "billing_summary" ? "billing" : "telemetry",
      format,
      startDate,
      endDate,
    });
    
    toast.success(`Generating ${format.toUpperCase()} export...`);
    
    try {
      const res = await fetch(`/api/portal/reports/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report_${reportType}_${Date.now()}.${format === "excel" ? "xls" : format}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Export downloaded!");
      } else {
        toast.error("Export failed");
      }
    } catch {
      toast.error("Export failed");
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case "telemetry_summary":
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
      case "alert_history":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "device_status":
        return <Cpu className="h-5 w-5 text-green-500" />;
      case "billing_summary":
        return <DollarSign className="h-5 w-5 text-purple-500" />;
      case "usage_analytics":
        return <TrendingUp className="h-5 w-5 text-pink-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportData.type) {
      case "telemetry_summary":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total Readings</p>
                <p className="text-3xl font-bold text-blue-700">{Number(reportData.totalReadings || 0).toLocaleString()}</p>
              </div>
            </div>
            {reportData.byVariable && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">By Variable</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(reportData.byVariable).map(([code, stats]) => (
                    <div key={code} className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="font-mono text-sm text-gray-500">{code}</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.count.toLocaleString()}</p>
                      <div className="mt-2 text-sm text-gray-500 space-y-1">
                        <p>Min: {stats.min.toFixed(2)}</p>
                        <p>Max: {stats.max.toFixed(2)}</p>
                        <p>Avg: {stats.avg.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "alert_history":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium">Total Alerts</p>
                <p className="text-3xl font-bold text-gray-700">{Number(reportData.totalAlerts || 0).toLocaleString()}</p>
              </div>
              {reportData.bySeverity && (
                <>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-600 font-medium">Critical</p>
                    <p className="text-3xl font-bold text-red-700">{reportData.bySeverity.critical || 0}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-600 font-medium">Warning</p>
                    <p className="text-3xl font-bold text-yellow-700">{reportData.bySeverity.warning || 0}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Info</p>
                    <p className="text-3xl font-bold text-blue-700">{reportData.bySeverity.info || 0}</p>
                  </div>
                </>
              )}
            </div>
            {reportData.byStatus && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">By Status</h3>
                <div className="flex gap-4">
                  {Object.entries(reportData.byStatus).map(([status, count]) => (
                    <Badge key={status} variant="outline" className="text-base py-2 px-4">
                      {status}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "device_status":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium">Total Devices</p>
                <p className="text-3xl font-bold text-gray-700">{Number(reportData.totalDevices || 0).toLocaleString()}</p>
              </div>
              {reportData.byStatus && (
                <>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Active</p>
                    <p className="text-3xl font-bold text-green-700">{reportData.byStatus.active || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 font-medium">Inactive</p>
                    <p className="text-3xl font-bold text-gray-700">{reportData.byStatus.inactive || 0}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-600 font-medium">Suspended</p>
                    <p className="text-3xl font-bold text-red-700">{reportData.byStatus.suspended || 0}</p>
                  </div>
                </>
              )}
            </div>
            {reportData.byType && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">By Device Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(reportData.byType).map(([type, count]) => (
                    <div key={type} className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-500">{type}</p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "billing_summary":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-purple-700">{Number(reportData.totalOrders || 0).toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Total Paid</p>
                <p className="text-3xl font-bold text-green-700">GHS {Number(reportData.totalPaid || 0).toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Active Subscriptions</p>
                <p className="text-3xl font-bold text-blue-700">{Number(reportData.activeSubscriptions || 0).toLocaleString()}</p>
              </div>
              <div className="bg-pink-50 rounded-lg p-4">
                <p className="text-sm text-pink-600 font-medium">Monthly Recurring</p>
                <p className="text-3xl font-bold text-pink-700">GHS {Number(reportData.monthlyRecurring || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );

      case "usage_analytics":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Telemetry Readings</p>
                <p className="text-3xl font-bold text-blue-700">{Number(reportData.telemetryReadings || 0).toLocaleString()}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-600 font-medium">Alerts Generated</p>
                <p className="text-3xl font-bold text-yellow-700">{Number(reportData.alertsGenerated || 0).toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Total Devices</p>
                <p className="text-3xl font-bold text-green-700">{Number(reportData.totalDevices || 0).toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Total Sites</p>
                <p className="text-3xl font-bold text-purple-700">{Number(reportData.totalSites || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-gray-500">No data available</p>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Generate and export reports for your IoT data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="telemetry_summary">Telemetry Summary</SelectItem>
                <SelectItem value="alert_history">Alert History</SelectItem>
                <SelectItem value="device_status">Device Status</SelectItem>
                <SelectItem value="billing_summary">Billing Summary</SelectItem>
                <SelectItem value="usage_analytics">Usage Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          {getReportIcon(reportType)}
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {reportType.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            </h2>
            <p className="text-sm text-gray-500">
              {format(new Date(startDate), "MMM d, yyyy")} - {format(new Date(endDate), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          renderReportContent()
        )}
      </div>
    </div>
  );
}
