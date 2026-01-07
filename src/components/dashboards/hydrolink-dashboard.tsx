"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Gauge, Activity, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface HydroLinkDashboardProps {
  deviceId: string;
}

interface Reading {
  timestamp: string;
  value: number;
  variable: string;
}

interface DeviceData {
  waterLevel: number;
  waterPressure: number;
  waterConsumption: number;
  waterStatus: string;
  history: Reading[];
}

export function HydroLinkDashboard({ deviceId }: HydroLinkDashboardProps) {
  const [data, setData] = useState<DeviceData>({
    waterLevel: 0,
    waterPressure: 0,
    waterConsumption: 0,
    waterStatus: "OK",
    history: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Demo data - replace with actual API call
        const mockHistory = Array.from({ length: 24 }, (_, i) => ({
          timestamp: `${i}:00`,
          value: 60 + Math.random() * 30,
          variable: "WL",
        }));

        setData({
          waterLevel: 75,
          waterPressure: 28.5,
          waterConsumption: 1250,
          waterStatus: "OK",
          history: mockHistory,
        });
      } catch (error) {
        console.error("Failed to fetch device data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const chartData = data.history.map((r) => ({
    time: r.timestamp,
    level: Number(r.value.toFixed(0)),
  }));

  const getWaterLevelColor = (level: number) => {
    if (level >= 70) return "text-green-400";
    if (level >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const getWaterLevelBadge = (level: number) => {
    if (level >= 70) return { text: "Good", color: "bg-green-600" };
    if (level >= 40) return { text: "Medium", color: "bg-yellow-600" };
    return { text: "Low", color: "bg-red-600" };
  };

  const levelBadge = getWaterLevelBadge(data.waterLevel);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Droplets className="h-6 w-6 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">HydroLink Dashboard</h1>
            </div>
            <p className="text-slate-400 mt-1 ml-12">Water Level & Pressure Monitor</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Water Level */}
        <Card className="border-slate-800 bg-gradient-to-br from-cyan-600/20 to-blue-600/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Water Level (WL)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${getWaterLevelColor(data.waterLevel)}`}>
                {isLoading ? "--" : data.waterLevel}
              </span>
              <span className="text-xl text-slate-400 mb-1">%</span>
            </div>
            <Badge className={`mt-2 ${levelBadge.color}`}>{levelBadge.text}</Badge>
          </CardContent>
        </Card>

        {/* Water Pressure */}
        <Card className="border-slate-800 bg-gradient-to-br from-purple-600/20 to-indigo-600/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Water Pressure (WP)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">
                {isLoading ? "--" : data.waterPressure.toFixed(1)}
              </span>
              <span className="text-xl text-slate-400 mb-1">PSIG</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Gauge className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-slate-400">0-40 PSIG Range</span>
            </div>
          </CardContent>
        </Card>

        {/* Water Consumption */}
        <Card className="border-slate-800 bg-gradient-to-br from-teal-600/20 to-emerald-600/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Consumption (WC)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">
                {isLoading ? "--" : data.waterConsumption}
              </span>
              <span className="text-xl text-slate-400 mb-1">L</span>
            </div>
            <Badge className="mt-2 bg-teal-600">Today</Badge>
          </CardContent>
        </Card>

        {/* Water Status */}
        <Card className="border-slate-800 bg-gradient-to-br from-green-600/20 to-lime-600/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Status (WS)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Activity className={`h-8 w-8 ${data.waterStatus === "OK" ? "text-green-400" : "text-red-400"}`} />
              <span className="text-2xl font-bold text-white">
                {data.waterStatus}
              </span>
            </div>
            <Badge className={`mt-2 ${data.waterStatus === "OK" ? "bg-green-600" : "bg-red-600"}`}>
              {data.waterStatus === "OK" ? "System Normal" : "Check System"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Water Level Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Tank Level</CardTitle>
            <CardDescription>Visual representation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 w-full max-w-[200px] mx-auto bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-1000"
                style={{ height: `${data.waterLevel}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-white drop-shadow-lg">
                  {data.waterLevel}%
                </span>
              </div>
              {/* Level markers */}
              {[25, 50, 75].map((level) => (
                <div
                  key={level}
                  className="absolute left-0 right-0 border-t border-dashed border-slate-600"
                  style={{ bottom: `${level}%` }}
                >
                  <span className="absolute -right-8 -top-2 text-xs text-slate-500">{level}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Water Level History</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="level"
                    stroke="#06b6d4"
                    fill="url(#waterGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pressure" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="pressure" className="data-[state=active]:bg-cyan-600">
            Pressure History
          </TabsTrigger>
          <TabsTrigger value="consumption" className="data-[state=active]:bg-cyan-600">
            Consumption
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pressure">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Pressure Over Time</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.map((d, i) => ({ ...d, pressure: 20 + Math.random() * 15 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 40]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#f1f5f9" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pressure"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumption">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Daily Water Consumption</CardTitle>
              <CardDescription>Liters per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-400">
                Consumption data will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
