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
  Wifi, WifiOff, RefreshCw, Sparkles, AlertTriangle, CheckCircle2, Info,
  ArrowUp, ArrowDown, Minus, Activity, Calendar, Clock
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import {
  WaterTankSVG,
  PowerMeterSVG,
  TemperatureGaugeSVG,
  GenericGaugeSVG,
  DeviceHealthSVG,
  ColdroomSVG,
} from "@/components/devices/DeviceVisualizations";

interface Variable {
  code: string;
  label: string;
  unit: string | null;
  category: string;
  minValue: number | null;
  maxValue: number | null;
  widget: string;
  isAlertable: boolean;
}

interface TelemetryData {
  device: {
    id: string;
    nickname: string | null;
    status: string;
    lastSeenAt: string | null;
    serialNumber: string | null;
  };
  deviceType: {
    id: string;
    name: string;
    category: string;
  } | null;
  variables: Variable[];
  latestReadings: Record<string, { value: number; capturedAt: string }>;
  chartData: Record<string, Array<{ time: string; value: number }>>;
  stats: Record<string, { min: number; max: number; avg: number; count: number }>;
  totalReadings: number;
}

interface AIRecommendation {
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  icon: React.ReactNode;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  water: Droplets,
  power: Zap,
  environment: Thermometer,
  industrial: Factory,
  other: Gauge,
};

const categoryColors: Record<string, { primary: string; gradient: string; bg: string }> = {
  water: { primary: "#3b82f6", gradient: "from-blue-500 to-cyan-400", bg: "bg-blue-50" },
  power: { primary: "#f59e0b", gradient: "from-amber-500 to-orange-400", bg: "bg-amber-50" },
  environment: { primary: "#10b981", gradient: "from-emerald-500 to-teal-400", bg: "bg-emerald-50" },
  industrial: { primary: "#8b5cf6", gradient: "from-violet-500 to-purple-400", bg: "bg-violet-50" },
  other: { primary: "#6b7280", gradient: "from-gray-500 to-slate-400", bg: "bg-gray-50" },
};

function generateAIRecommendations(
  data: TelemetryData,
  variables: Variable[]
): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];
  
  for (const variable of variables) {
    const reading = data.latestReadings[variable.code];
    const stats = data.stats[variable.code];
    
    if (!reading || !stats) continue;
    
    const value = reading.value;
    const { min, max, avg } = stats;
    
    // Check if value is within normal range
    if (variable.minValue !== null && value < variable.minValue) {
      recommendations.push({
        type: "warning",
        title: `Low ${variable.label}`,
        message: `Current ${variable.label.toLowerCase()} (${value}${variable.unit || ""}) is below the minimum threshold of ${variable.minValue}${variable.unit || ""}. Consider taking corrective action.`,
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      });
    } else if (variable.maxValue !== null && value > variable.maxValue) {
      recommendations.push({
        type: "warning",
        title: `High ${variable.label}`,
        message: `Current ${variable.label.toLowerCase()} (${value}${variable.unit || ""}) exceeds the maximum threshold of ${variable.maxValue}${variable.unit || ""}. Immediate attention may be required.`,
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      });
    } else if (value >= avg * 0.9 && value <= avg * 1.1) {
      recommendations.push({
        type: "success",
        title: `${variable.label} Stable`,
        message: `${variable.label} readings are consistent and within normal operating range. Current: ${value}${variable.unit || ""}, Average: ${avg.toFixed(1)}${variable.unit || ""}.`,
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    }
    
    // Trend analysis
    const chartData = data.chartData[variable.code];
    if (chartData && chartData.length >= 5) {
      const recent = chartData.slice(-5);
      const trend = recent[recent.length - 1].value - recent[0].value;
      const trendPercent = ((trend / recent[0].value) * 100).toFixed(1);
      
      if (Math.abs(Number(trendPercent)) > 10) {
        recommendations.push({
          type: "info",
          title: `${variable.label} Trend`,
          message: `${variable.label} has ${trend > 0 ? "increased" : "decreased"} by ${Math.abs(Number(trendPercent))}% in recent readings. ${trend > 0 ? "Monitor for potential issues." : "This may indicate improving conditions."}`,
          icon: <Info className="h-5 w-5 text-blue-500" />,
        });
      }
    }
  }
  
  // Add general recommendations if no specific ones
  if (recommendations.length === 0) {
    recommendations.push({
      type: "success",
      title: "All Systems Normal",
      message: "All monitored parameters are within expected ranges. Your device is operating optimally.",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    });
  }
  
  return recommendations.slice(0, 4); // Limit to 4 recommendations
}

function AnimatedValue({ value, unit, prevValue }: { value: number; unit: string | null; prevValue?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (prevValue !== undefined && prevValue !== value) {
      setIsAnimating(true);
      const duration = 500;
      const steps = 20;
      const increment = (value - prevValue) / steps;
      let current = prevValue;
      let step = 0;
      
      const interval = setInterval(() => {
        step++;
        current += increment;
        setDisplayValue(current);
        
        if (step >= steps) {
          clearInterval(interval);
          setDisplayValue(value);
          setIsAnimating(false);
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [value, prevValue]);
  
  const trend = prevValue !== undefined ? value - prevValue : 0;
  
  return (
    <div className="flex items-end gap-2">
      <span className={`text-4xl font-bold tabular-nums transition-all duration-300 ${isAnimating ? "scale-105" : ""}`}>
        {displayValue.toFixed(1)}
      </span>
      <span className="text-lg text-gray-500 mb-1">{unit || ""}</span>
      {trend !== 0 && (
        <span className={`flex items-center text-sm mb-1 ${trend > 0 ? "text-red-500" : "text-green-500"}`}>
          {trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(trend).toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Get icon for variable based on code or category
function getVariableIcon(code: string, category: string): React.ComponentType<{ className?: string }> {
  const codeUpper = code.toUpperCase();
  if (codeUpper.includes("VOLT") || codeUpper.includes("V")) return Zap;
  if (codeUpper.includes("AMP") || codeUpper.includes("A") || codeUpper.includes("CURRENT")) return Activity;
  if (codeUpper.includes("TEMP") || codeUpper.includes("T")) return Thermometer;
  if (codeUpper.includes("HUM") || codeUpper.includes("H")) return Droplets;
  if (codeUpper.includes("WATER") || codeUpper.includes("WL") || codeUpper.includes("LEVEL")) return Droplets;
  if (codeUpper.includes("POWER") || codeUpper.includes("PWR") || codeUpper.includes("KW")) return Zap;
  if (codeUpper.includes("FREQ") || codeUpper.includes("HZ")) return Activity;
  return categoryIcons[category] || Gauge;
}

// Variable-specific colors for charts
const variableColors: Record<string, string> = {
  voltage: "#f59e0b",
  volt: "#f59e0b",
  v: "#f59e0b",
  amp: "#ef4444",
  amps: "#ef4444",
  current: "#ef4444",
  power: "#8b5cf6",
  pwr: "#8b5cf6",
  kw: "#8b5cf6",
  kwh: "#10b981",
  energy: "#10b981",
  temp: "#3b82f6",
  temperature: "#3b82f6",
  humidity: "#06b6d4",
  water: "#0ea5e9",
  level: "#0ea5e9",
  freq: "#ec4899",
  hz: "#ec4899",
};

function getVariableColor(code: string, fallback: string): string {
  const codeLower = code.toLowerCase();
  for (const [key, color] of Object.entries(variableColors)) {
    if (codeLower.includes(key)) return color;
  }
  return fallback;
}

function ReadingCard({ 
  variable, 
  value, 
  prevValue,
  stats,
  category,
  isSelected
}: { 
  variable: Variable; 
  value: number; 
  prevValue?: number;
  stats?: { min: number; max: number; avg: number };
  category: string;
  isSelected?: boolean;
}) {
  const colors = categoryColors[category] || categoryColors.other;
  const varColor = getVariableColor(variable.code, colors.primary);
  const isInRange = (variable.minValue === null || value >= variable.minValue) && 
                    (variable.maxValue === null || value <= variable.maxValue);
  
  // Calculate change from previous value
  const change = prevValue !== undefined ? value - prevValue : 0;
  const changePercent = prevValue !== undefined && prevValue !== 0 
    ? ((change / prevValue) * 100) 
    : 0;
  
  // Get icon for this variable
  const VarIcon = getVariableIcon(variable.code, category);
  
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${!isInRange ? "ring-2 ring-amber-400" : ""} ${isSelected ? "ring-2 ring-[#f74780] ring-offset-2" : ""}`}>
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, ${varColor}, ${varColor}88)` }} />
      <CardContent className="p-4">
        {/* Header with icon and label */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${varColor}15` }}>
              <span style={{ color: varColor }}><VarIcon className="h-4 w-4" /></span>
            </div>
            <span className="text-sm font-medium text-gray-700">{variable.label}</span>
          </div>
          {!isInRange && <AlertTriangle className="h-4 w-4 text-amber-500" />}
        </div>
        
        {/* Current Value - Large */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-3xl font-bold tabular-nums" style={{ color: varColor }}>
            {value.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">{variable.unit || ""}</span>
        </div>
        
        {/* Previous vs Current with Change Indicator */}
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mb-3">
          <div className="text-xs">
            <span className="text-gray-500">Previous: </span>
            <span className="font-medium text-gray-700">
              {prevValue !== undefined ? prevValue.toFixed(1) : "--"}{variable.unit || ""}
            </span>
          </div>
          {change !== 0 && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              change > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
            }`}>
              {change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span>{Math.abs(changePercent).toFixed(1)}%</span>
            </div>
          )}
          {change === 0 && prevValue !== undefined && (
            <div className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              <Minus className="h-3 w-3" />
              <span>0%</span>
            </div>
          )}
        </div>
        
        {/* Stats Row */}
        {stats && (
          <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-blue-500" />
              <span>Min: {stats.min.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="h-3 w-3 text-gray-400" />
              <span>Avg: {stats.avg.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>Max: {stats.max.toFixed(1)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DeviceDashboard({ deviceId }: { deviceId: string }) {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [prevReadings, setPrevReadings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
  
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const res = await fetch(`/api/portal/devices/${deviceId}/telemetry?hours=24&limit=200`);
      if (!res.ok) throw new Error("Failed to fetch telemetry");
      
      const newData = await res.json();
      
      // Store previous readings for animation
      if (data?.latestReadings) {
        const prev: Record<string, number> = {};
        for (const [code, reading] of Object.entries(data.latestReadings)) {
          prev[code] = (reading as { value: number }).value;
        }
        setPrevReadings(prev);
      }
      
      setData(newData);
      
      // Auto-select first variable for chart
      if (!selectedVariable && newData.variables.length > 0) {
        setSelectedVariable(newData.variables[0].code);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [deviceId, data, selectedVariable]);
  
  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200" />
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-t-[#f74780] animate-spin" />
          </div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || "Failed to load data"}</p>
        <Button onClick={() => fetchData()} className="mt-4">Retry</Button>
      </div>
    );
  }
  
  const category = data.deviceType?.category || "other";
  const colors = categoryColors[category];
  const Icon = categoryIcons[category] || Gauge;
  const recommendations = generateAIRecommendations(data, data.variables);
  
  // Device is online if last seen within 5 minutes (for real-time dashboard)
  // Use 5 minutes for dashboard responsiveness, system health uses 3 hours for alerts
  const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
  const isOnline = data.device.lastSeenAt && 
    (new Date().getTime() - new Date(data.device.lastSeenAt).getTime()) < ONLINE_THRESHOLD_MS;
  
  // Calculate health score based on readings within range
  const calculateHealthScore = () => {
    if (data.variables.length === 0) return 100;
    let inRangeCount = 0;
    for (const variable of data.variables) {
      const reading = data.latestReadings[variable.code];
      if (!reading) continue;
      const isInRange = (variable.minValue === null || reading.value >= variable.minValue) && 
                        (variable.maxValue === null || reading.value <= variable.maxValue);
      if (isInRange) inRangeCount++;
    }
    return Math.round((inRangeCount / data.variables.length) * 100);
  };
  const healthScore = calculateHealthScore();

  // Get primary variable for visualization
  const primaryVariable = data.variables[0];
  const primaryReading = primaryVariable ? data.latestReadings[primaryVariable.code] : null;
  const primaryStats = primaryVariable ? data.stats[primaryVariable.code] : null;

  // Group variables by category for multi-category devices
  const groupVariablesByCategory = () => {
    const groups: Record<string, Variable[]> = {};
    for (const variable of data.variables) {
      const cat = variable.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(variable);
    }
    return groups;
  };
  
  const variableGroups = groupVariablesByCategory();
  const uniqueCategories = Object.keys(variableGroups);
  const isMultiCategory = uniqueCategories.length > 1;

  // Check if this is a coldroom-type device (has temperature + humidity)
  const isColdroom = variableGroups.temperature && (variableGroups.humidity || variableGroups.power);

  // Render device-specific visualization
  const renderDeviceVisualization = () => {
    if (!primaryVariable || !primaryReading) return null;
    
    const min = primaryVariable.minValue ?? (primaryStats?.min ?? 0);
    const max = primaryVariable.maxValue ?? (primaryStats?.max ?? 100);
    const isWarning = (primaryVariable.minValue !== null && primaryReading.value < primaryVariable.minValue) ||
                      (primaryVariable.maxValue !== null && primaryReading.value > primaryVariable.maxValue);

    // For coldroom/multi-sensor devices, show combined visualization
    if (isColdroom) {
      const tempVar = variableGroups.temperature?.[0];
      const humidVar = variableGroups.humidity?.[0];
      const powerVar = variableGroups.power?.[0] || variableGroups.energy?.[0];
      
      const tempReading = tempVar ? data.latestReadings[tempVar.code] : null;
      const humidReading = humidVar ? data.latestReadings[humidVar.code] : null;
      const powerReading = powerVar ? data.latestReadings[powerVar.code] : null;
      
      return (
        <ColdroomSVG
          temperature={tempReading ? {
            value: tempReading.value,
            unit: tempVar?.unit || "°C",
            min: tempVar?.minValue ?? undefined,
            max: tempVar?.maxValue ?? undefined,
          } : undefined}
          humidity={humidReading ? {
            value: humidReading.value,
            unit: humidVar?.unit || "%",
            min: humidVar?.minValue ?? undefined,
            max: humidVar?.maxValue ?? undefined,
          } : undefined}
          power={powerReading ? {
            value: powerReading.value,
            unit: powerVar?.unit || "kW",
          } : undefined}
          isWarning={isWarning}
        />
      );
    }

    switch (category) {
      case "water":
        return (
          <WaterTankSVG
            value={primaryReading.value}
            min={min}
            max={max}
            unit={primaryVariable.unit || "%"}
            label={primaryVariable.label}
            isWarning={isWarning}
          />
        );
      case "power":
        return (
          <PowerMeterSVG
            value={primaryReading.value}
            min={min}
            max={max}
            unit={primaryVariable.unit || "kW"}
            label={primaryVariable.label}
            isWarning={isWarning}
          />
        );
      case "environment":
        return (
          <TemperatureGaugeSVG
            value={primaryReading.value}
            min={min}
            max={max}
            unit={primaryVariable.unit || "°C"}
            label={primaryVariable.label}
            isWarning={isWarning}
          />
        );
      default:
        return (
          <GenericGaugeSVG
            value={primaryReading.value}
            min={min}
            max={max}
            unit={primaryVariable.unit || ""}
            label={primaryVariable.label}
            isWarning={isWarning}
          />
        );
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {data.device.nickname || data.deviceType?.name || "Device"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{data.device.serialNumber}</span>
              {isOnline ? (
                <Badge className="bg-green-100 text-green-700 border-0">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Device Health & Visualization Section */}
      {data.variables.length > 0 && (
        <Card className="overflow-hidden">
          <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Device Health */}
              <div className="flex flex-col items-center">
                <DeviceHealthSVG 
                  healthScore={healthScore} 
                  isOnline={!!isOnline}
                  category={category}
                />
                <p className="text-sm font-medium text-gray-600 mt-2">Device Health</p>
                <p className="text-xs text-gray-400">
                  {healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs Attention"}
                </p>
              </div>
              
              {/* Primary Visualization */}
              <div className="flex justify-center">
                {renderDeviceVisualization()}
              </div>
              
              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{data.totalReadings}</p>
                    <p className="text-xs text-gray-500">Readings (24h)</p>
                  </div>
                </div>
                {primaryStats && (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{primaryStats.max.toFixed(1)} {primaryVariable?.unit}</p>
                        <p className="text-xs text-gray-500">24h High</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{primaryStats.min.toFixed(1)} {primaryVariable?.unit}</p>
                        <p className="text-xs text-gray-500">24h Low</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Reading Cards - 4 per row */}
      {data.variables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.variables.map((variable) => {
            const reading = data.latestReadings[variable.code];
            return reading ? (
              <div 
                key={variable.code}
                onClick={() => setSelectedVariable(variable.code)}
                className="cursor-pointer"
              >
                <ReadingCard
                  variable={variable}
                  value={reading.value}
                  prevValue={prevReadings[variable.code]}
                  stats={data.stats[variable.code]}
                  category={category}
                  isSelected={selectedVariable === variable.code}
                />
              </div>
            ) : null;
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Icon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No readings yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Data will appear here once the device starts sending readings
          </p>
        </Card>
      )}
      
      {/* Chart with Dropdown and Date/Time Filters */}
      {selectedVariable && data.chartData[selectedVariable] && data.chartData[selectedVariable].length > 0 && (() => {
        const selectedVar = data.variables.find(v => v.code === selectedVariable);
        const selectedStats = data.stats[selectedVariable];
        const chartData = data.chartData[selectedVariable];
        const varColor = getVariableColor(selectedVariable, colors.primary);
        const VarIcon = getVariableIcon(selectedVariable, category);
        
        return (
          <Card className="overflow-hidden">
            <div className="h-1" style={{ background: `linear-gradient(to right, ${varColor}, ${varColor}66)` }} />
            <CardHeader className="pb-2">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: `${varColor}15` }}>
                    <span style={{ color: varColor }}><VarIcon className="h-5 w-5" /></span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedVar?.label || selectedVariable} Trend
                    </CardTitle>
                    {selectedStats && (
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="flex items-center gap-1 text-green-600">
                          <ArrowUp className="h-3 w-3" />
                          {selectedStats.max.toFixed(1)}{selectedVar?.unit || ""}
                        </span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <ArrowDown className="h-3 w-3" />
                          {selectedStats.min.toFixed(1)}{selectedVar?.unit || ""}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Minus className="h-3 w-3" />
                          {selectedStats.avg.toFixed(1)}{selectedVar?.unit || ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Controls Row */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Variable Dropdown */}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500 whitespace-nowrap">Variable:</Label>
                    <Select value={selectedVariable} onValueChange={setSelectedVariable}>
                      <SelectTrigger className="w-[140px] h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {data.variables.map((v) => {
                          const vColor = getVariableColor(v.code, colors.primary);
                          const VIcon = getVariableIcon(v.code, category);
                          return (
                            <SelectItem key={v.code} value={v.code}>
                              <div className="flex items-center gap-2">
                                <span style={{ color: vColor }}><VIcon className="h-3 w-3" /></span>
                                <span>{v.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Date Filter */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      className="w-[130px] h-8 text-sm"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  {/* Time Range */}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <Select defaultValue="24h">
                      <SelectTrigger className="w-[100px] h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Last 1h</SelectItem>
                        <SelectItem value="6h">Last 6h</SelectItem>
                        <SelectItem value="12h">Last 12h</SelectItem>
                        <SelectItem value="24h">Last 24h</SelectItem>
                        <SelectItem value="7d">Last 7d</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  <AreaChart data={Array.isArray(chartData) ? chartData : []}>
                    <defs>
                      <linearGradient id={`colorValue-${selectedVariable}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={varColor} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={varColor} stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}${selectedVar?.unit || ""}`}
                    />
                    <Tooltip 
                      labelFormatter={(t) => new Date(t).toLocaleString()}
                      contentStyle={{ 
                        borderRadius: "12px", 
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        padding: "12px"
                      }}
                      formatter={(value) => value !== undefined ? [`${Number(value).toFixed(2)} ${selectedVar?.unit || ""}`, selectedVar?.label || "Value"] : ["", ""]}
                    />
                    {/* High threshold line */}
                    {selectedVar?.maxValue !== null && selectedVar?.maxValue !== undefined && (
                      <ReferenceLine 
                        y={selectedVar.maxValue} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5"
                        strokeWidth={1.5}
                        label={{ value: `Max: ${selectedVar.maxValue}`, position: "insideTopRight", fill: "#ef4444", fontSize: 10 }}
                      />
                    )}
                    {/* Low threshold line */}
                    {selectedVar?.minValue !== null && selectedVar?.minValue !== undefined && (
                      <ReferenceLine 
                        y={selectedVar.minValue} 
                        stroke="#3b82f6" 
                        strokeDasharray="5 5"
                        strokeWidth={1.5}
                        label={{ value: `Min: ${selectedVar.minValue}`, position: "insideBottomRight", fill: "#3b82f6", fontSize: 10 }}
                      />
                    )}
                    {/* Average line */}
                    {selectedStats && (
                      <ReferenceLine 
                        y={selectedStats.avg} 
                        stroke="#9ca3af" 
                        strokeDasharray="3 3"
                        strokeWidth={1}
                      />
                    )}
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={varColor}
                      strokeWidth={2.5}
                      fill={`url(#colorValue-${selectedVariable})`}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      dot={false}
                      activeDot={{ r: 6, fill: varColor, stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 rounded" style={{ backgroundColor: varColor }} />
                  <span>{selectedVar?.label || "Value"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-red-500 rounded" style={{ borderStyle: "dashed" }} />
                  <span>Max Threshold</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-blue-500 rounded" style={{ borderStyle: "dashed" }} />
                  <span>Min Threshold</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-gray-400 rounded" style={{ borderStyle: "dashed" }} />
                  <span>Average</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}
      
      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-[#f74780]" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div 
                key={i}
                className={`flex items-start gap-3 p-4 rounded-lg ${
                  rec.type === "success" ? "bg-green-50" :
                  rec.type === "warning" ? "bg-amber-50" :
                  "bg-blue-50"
                }`}
              >
                {rec.icon}
                <div>
                  <p className="font-medium text-gray-900">{rec.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Last Updated */}
      <p className="text-center text-sm text-gray-400">
        Last updated: {data.device.lastSeenAt ? new Date(data.device.lastSeenAt).toLocaleString() : "Never"}
        {" • "}{data.totalReadings} readings in last 24 hours
      </p>
    </div>
  );
}
