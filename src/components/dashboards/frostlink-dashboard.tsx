"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Thermometer, Power, ToggleLeft, ToggleRight, ArrowLeft, RefreshCw } from "lucide-react";
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
} from "recharts";

interface FrostLinkDashboardProps {
  deviceId: string;
}

interface Reading {
  timestamp: string;
  value: number;
  variable: string;
}

interface DeviceData {
  temperature: number;
  ac1: boolean;
  in1: boolean;
  in2: boolean;
  history: Reading[];
}

export function FrostLinkDashboard({ deviceId }: FrostLinkDashboardProps) {
  const [data, setData] = useState<DeviceData>({
    temperature: 0,
    ac1: false,
    in1: false,
    in2: false,
    history: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data - replace with actual API call
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Demo data - replace with actual API call
        // const response = await fetch(`/api/devices/${deviceId}/readings`);
        // const result = await response.json();
        
        // Simulated data
        const mockHistory = Array.from({ length: 24 }, (_, i) => ({
          timestamp: `${i}:00`,
          value: -18 + Math.random() * 4 - 2,
          variable: "T",
        }));

        setData({
          temperature: -18.5,
          ac1: true,
          in1: false,
          in2: true,
          history: mockHistory,
        });
      } catch (error) {
        console.error("Failed to fetch device data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [deviceId]);

  const chartData = data.history.map((r) => ({
    time: r.timestamp,
    temperature: Number(r.value.toFixed(1)),
  }));

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
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Thermometer className="h-6 w-6 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">FrostLink Dashboard</h1>
            </div>
            <p className="text-slate-400 mt-1 ml-12">Coldroom Temperature Monitor</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Temperature */}
        <Card className="border-slate-800 bg-gradient-to-br from-blue-600/20 to-cyan-600/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Temperature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">
                {isLoading ? "--" : data.temperature.toFixed(1)}
              </span>
              <span className="text-xl text-slate-400 mb-1">°C</span>
            </div>
            <Badge className="mt-2 bg-green-600">Normal</Badge>
          </CardContent>
        </Card>

        {/* AC1 Input */}
        <Card className="border-slate-800 bg-gradient-to-br from-yellow-600/20 to-orange-600/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">AC1 Input</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Power className={`h-8 w-8 ${data.ac1 ? "text-green-400" : "text-red-400"}`} />
              <span className="text-2xl font-bold text-white">
                {data.ac1 ? "ON" : "OFF"}
              </span>
            </div>
            <Badge className={`mt-2 ${data.ac1 ? "bg-green-600" : "bg-red-600"}`}>
              {data.ac1 ? "Power Available" : "No Power"}
            </Badge>
          </CardContent>
        </Card>

        {/* IN1 */}
        <Card className="border-slate-800 bg-gradient-to-br from-purple-600/20 to-pink-600/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Input 1 (IN1)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {data.in1 ? (
                <ToggleRight className="h-8 w-8 text-green-400" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-slate-400" />
              )}
              <span className="text-2xl font-bold text-white">
                {data.in1 ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* IN2 */}
        <Card className="border-slate-800 bg-gradient-to-br from-teal-600/20 to-emerald-600/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Input 2 (IN2)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {data.in2 ? (
                <ToggleRight className="h-8 w-8 text-green-400" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-slate-400" />
              )}
              <span className="text-2xl font-bold text-white">
                {data.in2 ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="temperature" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="temperature" className="data-[state=active]:bg-blue-600">
            Temperature History
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-600">
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="temperature">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Temperature Over Time</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[-25, 0]} />
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
                      dataKey="temperature"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Recent Alerts</CardTitle>
              <CardDescription>Temperature and system alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-400">
                No alerts in the last 24 hours
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
