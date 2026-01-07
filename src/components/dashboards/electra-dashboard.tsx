"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Power, Activity, ArrowLeft, RefreshCw } from "lucide-react";
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
  BarChart,
  Bar,
} from "recharts";

interface ElectraDashboardProps {
  deviceId: string;
}

interface Reading {
  timestamp: string;
  value: number;
  variable: string;
}

interface DeviceData {
  currentPower: number;
  todayConsumption: number;
  generatorStatus: boolean;
  powerStatus: boolean;
  history: Reading[];
}

export function ElectraDashboard({ deviceId }: ElectraDashboardProps) {
  const [data, setData] = useState<DeviceData>({
    currentPower: 0,
    todayConsumption: 0,
    generatorStatus: false,
    powerStatus: true,
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
          value: 2 + Math.random() * 3,
          variable: "K",
        }));

        setData({
          currentPower: 3.5,
          todayConsumption: 45.2,
          generatorStatus: false,
          powerStatus: true,
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
    power: Number(r.value.toFixed(2)),
  }));

  const dailyData = [
    { day: "Mon", consumption: 42 },
    { day: "Tue", consumption: 38 },
    { day: "Wed", consumption: 45 },
    { day: "Thu", consumption: 41 },
    { day: "Fri", consumption: 48 },
    { day: "Sat", consumption: 35 },
    { day: "Sun", consumption: 32 },
  ];

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
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Electra Dashboard</h1>
            </div>
            <p className="text-slate-400 mt-1 ml-12">Power Consumption Monitor</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Current Power */}
        <Card className="border-slate-800 bg-gradient-to-br from-yellow-600/20 to-orange-600/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Current Power</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">
                {isLoading ? "--" : data.currentPower.toFixed(1)}
              </span>
              <span className="text-xl text-slate-400 mb-1">kW</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Live</span>
            </div>
          </CardContent>
        </Card>

        {/* Today's Consumption */}
        <Card className="border-slate-800 bg-gradient-to-br from-blue-600/20 to-indigo-600/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Today&apos;s Consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">
                {isLoading ? "--" : data.todayConsumption.toFixed(1)}
              </span>
              <span className="text-xl text-slate-400 mb-1">kWh</span>
            </div>
            <Badge className="mt-2 bg-blue-600">Normal Usage</Badge>
          </CardContent>
        </Card>

        {/* Power Status */}
        <Card className="border-slate-800 bg-gradient-to-br from-green-600/20 to-emerald-600/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Power Status (PS)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Power className={`h-8 w-8 ${data.powerStatus ? "text-green-400" : "text-red-400"}`} />
              <span className="text-2xl font-bold text-white">
                {data.powerStatus ? "ON" : "OFF"}
              </span>
            </div>
            <Badge className={`mt-2 ${data.powerStatus ? "bg-green-600" : "bg-red-600"}`}>
              {data.powerStatus ? "Mains Power" : "No Power"}
            </Badge>
          </CardContent>
        </Card>

        {/* Generator Status */}
        <Card className="border-slate-800 bg-gradient-to-br from-purple-600/20 to-pink-600/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Generator (EG)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Zap className={`h-8 w-8 ${data.generatorStatus ? "text-yellow-400" : "text-slate-400"}`} />
              <span className="text-2xl font-bold text-white">
                {data.generatorStatus ? "ON" : "OFF"}
              </span>
            </div>
            <Badge className={`mt-2 ${data.generatorStatus ? "bg-yellow-600" : "bg-slate-600"}`}>
              {data.generatorStatus ? "Running" : "Standby"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="realtime" className="data-[state=active]:bg-yellow-600">
            Real-time Power
          </TabsTrigger>
          <TabsTrigger value="daily" className="data-[state=active]:bg-yellow-600">
            Daily Consumption
          </TabsTrigger>
        </TabsList>

        <TabsContent value="realtime">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Power Usage Over Time</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
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
                      dataKey="power"
                      stroke="#eab308"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Weekly Consumption</CardTitle>
              <CardDescription>Daily power usage in kWh</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#f1f5f9" }}
                    />
                    <Bar dataKey="consumption" fill="#eab308" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
