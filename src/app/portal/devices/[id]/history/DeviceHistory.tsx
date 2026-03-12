"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Droplets, Zap, Thermometer, Factory, Gauge, TrendingUp, TrendingDown,
  RefreshCw, Calendar, Download, ArrowUpRight, ArrowDownRight, Minus,
  BarChart3, Clock, GitCompare, ChevronLeft, ChevronRight
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Line,
  LineChart,
  Legend,
  ReferenceLine,
} from "recharts";

interface Variable {
  code: string;
  label: string;
  unit: string | null;
  category: string;
  minValue: number | null;
  maxValue: number | null;
}

interface HistoryData {
  device: {
    id: string;
    nickname: string | null;
    status: string;
    serialNumber: string | null;
  };
  deviceType: {
    id: string;
    name: string;
    category: string;
  } | null;
  variables: Variable[];
  dateRange: {
    start: string;
    end: string;
  };
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  aggregation: string;
  readings: Record<string, Array<{ time: string; value: number; formattedTime: string }>>;
  stats: Record<string, { 
    min: number; 
    max: number; 
    avg: number; 
    count: number;
    first: number;
    last: number;
    change: number;
    changePercent: number;
  }>;
  comparison: {
    dateRange: { start: string; end: string };
    readings: Record<string, Array<{ time: string; value: number }>>;
    stats: Record<string, { min: number; max: number; avg: number; count: number }>;
  } | null;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  water: Droplets,
  power: Zap,
  environment: Thermometer,
  industrial: Factory,
  other: Gauge,
};

const categoryColors: Record<string, { primary: string; gradient: string }> = {
  water: { primary: "#3b82f6", gradient: "from-blue-500 to-cyan-400" },
  power: { primary: "#f59e0b", gradient: "from-amber-500 to-orange-400" },
  environment: { primary: "#10b981", gradient: "from-emerald-500 to-teal-400" },
  industrial: { primary: "#8b5cf6", gradient: "from-violet-500 to-purple-400" },
  other: { primary: "#6b7280", gradient: "from-gray-500 to-slate-400" },
};

const presetRanges = [
  { label: "Last 24 Hours", value: "24h", days: 1 },
  { label: "Last 7 Days", value: "7d", days: 7 },
  { label: "Last 30 Days", value: "30d", days: 30 },
  { label: "Last 90 Days", value: "90d", days: 90 },
  { label: "Custom", value: "custom", days: 0 },
];

interface DeviceHistoryProps {
  deviceId: string;
  deviceName: string;
}

export default function DeviceHistory({ deviceId, deviceName }: DeviceHistoryProps) {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState("7d");
  const [aggregation, setAggregation] = useState("raw");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  // Comparison states
  const [showComparison, setShowComparison] = useState(false);
  const [compareStartDate, setCompareStartDate] = useState("");
  const [compareEndDate, setCompareEndDate] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);

  const getDateRange = useCallback(() => {
    if (selectedRange === "custom" && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }
    
    const preset = presetRanges.find(r => r.value === selectedRange);
    if (preset && preset.days > 0) {
      const end = new Date();
      const start = new Date(end.getTime() - preset.days * 24 * 60 * 60 * 1000);
      return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };
    }
    
    return { startDate: "", endDate: "" };
  }, [selectedRange, customStartDate, customEndDate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { startDate, endDate } = getDateRange();
      
      let url = `/api/portal/devices/${deviceId}/history?page=${page}&aggregation=${aggregation}`;
      
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (selectedVariable) url += `&variable=${selectedVariable}`;
      
      if (showComparison && compareStartDate && compareEndDate) {
        url += `&compareStartDate=${compareStartDate}&compareEndDate=${compareEndDate}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch history");
      
      const newData = await res.json();
      setData(newData);
      
      if (!selectedVariable && newData.variables.length > 0) {
        setSelectedVariable(newData.variables[0].code);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [deviceId, page, aggregation, selectedVariable, showComparison, compareStartDate, compareEndDate, getDateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    if (!data || !selectedVariable) return;
    
    const readings = data.readings[selectedVariable] || [];
    const csvContent = [
      ["Time", "Value", selectedVariable].join(","),
      ...readings.map(r => [r.time, r.value, ""].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deviceName}-${selectedVariable}-history.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200" />
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-t-[#f74780] animate-spin" />
          </div>
          <p className="text-gray-500">Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchData} className="mt-4">Retry</Button>
      </div>
    );
  }

  if (!data) return null;

  const category = data.deviceType?.category || "other";
  const colors = categoryColors[category];
  const Icon = categoryIcons[category] || Gauge;
  const selectedVar = data.variables.find(v => v.code === selectedVariable);
  const currentStats = selectedVariable ? data.stats[selectedVariable] : null;
  const comparisonStats = data.comparison?.stats && selectedVariable 
    ? data.comparison.stats[selectedVariable] 
    : null;

  // Prepare chart data for comparison view
  const prepareComparisonChartData = () => {
    if (!selectedVariable || !data.readings[selectedVariable]) return [];
    
    const currentReadings = data.readings[selectedVariable];
    const comparisonReadings = data.comparison?.readings[selectedVariable] || [];
    
    // Normalize timestamps for comparison (use relative time)
    const maxLength = Math.max(currentReadings.length, comparisonReadings.length);
    const chartData = [];
    
    for (let i = 0; i < maxLength; i++) {
      chartData.push({
        index: i,
        current: currentReadings[i]?.value,
        comparison: comparisonReadings[i]?.value,
        currentTime: currentReadings[i]?.formattedTime,
        comparisonTime: comparisonReadings[i]?.time 
          ? new Date(comparisonReadings[i].time).toLocaleString() 
          : undefined,
      });
    }
    
    return chartData;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{deviceName} - History</h2>
            <p className="text-sm text-gray-500">
              View and compare historical readings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={!selectedVariable}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Preset */}
            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select value={selectedRange} onValueChange={setSelectedRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {presetRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {selectedRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Variable Selection */}
            <div className="space-y-2">
              <Label>Variable</Label>
              <Select value={selectedVariable || ""} onValueChange={setSelectedVariable}>
                <SelectTrigger>
                  <SelectValue placeholder="Select variable" />
                </SelectTrigger>
                <SelectContent>
                  {data.variables.map(v => (
                    <SelectItem key={v.code} value={v.code}>
                      {v.label} ({v.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aggregation */}
            <div className="space-y-2">
              <Label>Aggregation</Label>
              <Select value={aggregation} onValueChange={setAggregation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw">Raw Data</SelectItem>
                  <SelectItem value="hourly">Hourly Average</SelectItem>
                  <SelectItem value="daily">Daily Average</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comparison Toggle */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Compare with another period</span>
              </div>
              <Button
                variant={showComparison ? "default" : "outline"}
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
                className={showComparison ? "bg-[#f74780] hover:bg-[#e03a6f]" : ""}
              >
                {showComparison ? "Comparing" : "Enable Comparison"}
              </Button>
            </div>
            
            {showComparison && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label>Compare Start Date</Label>
                  <Input
                    type="date"
                    value={compareStartDate}
                    onChange={(e) => setCompareStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Compare End Date</Label>
                  <Input
                    type="date"
                    value={compareEndDate}
                    onChange={(e) => setCompareEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {currentStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <TrendingDown className="h-4 w-4" />
                Minimum
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {currentStats.min.toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">{selectedVar?.unit}</span>
              </p>
              {comparisonStats && (
                <p className="text-xs text-gray-400 mt-1">
                  Compare: {comparisonStats.min.toFixed(1)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                Maximum
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {currentStats.max.toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">{selectedVar?.unit}</span>
              </p>
              {comparisonStats && (
                <p className="text-xs text-gray-400 mt-1">
                  Compare: {comparisonStats.max.toFixed(1)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Minus className="h-4 w-4" />
                Average
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {currentStats.avg.toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">{selectedVar?.unit}</span>
              </p>
              {comparisonStats && (
                <p className="text-xs text-gray-400 mt-1">
                  Compare: {comparisonStats.avg.toFixed(1)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <BarChart3 className="h-4 w-4" />
                Readings
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {currentStats.count.toLocaleString()}
              </p>
              {comparisonStats && (
                <p className="text-xs text-gray-400 mt-1">
                  Compare: {comparisonStats.count.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Clock className="h-4 w-4" />
                Change
              </div>
              <p className={`text-2xl font-bold ${currentStats.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {currentStats.change >= 0 ? "+" : ""}{currentStats.change.toFixed(1)}
                <span className="text-sm font-normal ml-1">{selectedVar?.unit}</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                {currentStats.changePercent >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                Change %
              </div>
              <p className={`text-2xl font-bold ${currentStats.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                {currentStats.changePercent >= 0 ? "+" : ""}{currentStats.changePercent.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      {selectedVariable && data.readings[selectedVariable] && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedVar?.label || selectedVariable} Over Time
              </CardTitle>
              <div className="flex gap-2">
                {data.variables.map(v => (
                  <Button
                    key={v.code}
                    variant={selectedVariable === v.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariable(v.code)}
                    className={selectedVariable === v.code ? `bg-gradient-to-r ${colors.gradient}` : ""}
                  >
                    {v.code}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {showComparison && data.comparison ? (
                  <LineChart data={prepareComparisonChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="index" 
                      stroke="#9ca3af"
                      fontSize={12}
                      tickFormatter={(i) => `${i}`}
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      formatter={(value, name) => {
                        if (value === undefined) return ["", ""];
                        const label = name === "current" ? "Current Period" : "Comparison Period";
                        return [`${Number(value).toFixed(2)} ${selectedVar?.unit || ""}`, label];
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="current" 
                      stroke={colors.primary}
                      strokeWidth={2}
                      dot={false}
                      name="Current Period"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="comparison" 
                      stroke="#9ca3af"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Comparison Period"
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={data.readings[selectedVariable]}>
                    <defs>
                      <linearGradient id="colorValueHistory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="formattedTime" 
                      stroke="#9ca3af"
                      fontSize={12}
                      interval="preserveStartEnd"
                    />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      labelFormatter={(label) => label}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      formatter={(value) => value !== undefined ? [`${Number(value).toFixed(2)} ${selectedVar?.unit || ""}`, selectedVar?.label || "Value"] : ["", ""]}
                    />
                    {selectedVar?.maxValue !== null && selectedVar?.maxValue !== undefined && (
                      <ReferenceLine 
                        y={selectedVar.maxValue} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5"
                        label={{ value: `Max`, position: "right", fill: "#ef4444", fontSize: 10 }}
                      />
                    )}
                    {selectedVar?.minValue !== null && selectedVar?.minValue !== undefined && (
                      <ReferenceLine 
                        y={selectedVar.minValue} 
                        stroke="#3b82f6" 
                        strokeDasharray="5 5"
                        label={{ value: `Min`, position: "right", fill: "#3b82f6", fontSize: 10 }}
                      />
                    )}
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={colors.primary}
                      strokeWidth={2}
                      fill="url(#colorValueHistory)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing page {data.pagination.page} of {data.pagination.totalPages} 
            ({data.pagination.totalCount.toLocaleString()} total readings)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page === data.pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Data Table Preview */}
      {selectedVariable && data.readings[selectedVariable] && data.readings[selectedVariable].length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Readings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Time</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">
                      {selectedVar?.label} ({selectedVar?.unit || "-"})
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.readings[selectedVariable].slice(-20).reverse().map((reading, i) => {
                    const minVal = selectedVar?.minValue;
                    const maxVal = selectedVar?.maxValue;
                    const isInRange = (minVal === null || minVal === undefined || reading.value >= minVal) &&
                                     (maxVal === null || maxVal === undefined || reading.value <= maxVal);
                    return (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-600">{reading.formattedTime}</td>
                        <td className="py-2 px-3 text-right font-mono font-medium">
                          {reading.value.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <Badge 
                            variant="outline" 
                            className={isInRange 
                              ? "border-green-200 bg-green-50 text-green-700" 
                              : "border-amber-200 bg-amber-50 text-amber-700"
                            }
                          >
                            {isInRange ? "Normal" : "Alert"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
