"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Radio, RefreshCw, Search, ChevronLeft, ChevronRight, 
  Activity, Clock, Building2, Cpu
} from "lucide-react";

interface TelemetryMessage {
  id: string;
  tenantDeviceId: string | null;
  inventoryId: string | null;
  tenantId: string | null;
  tenantName: string | null;
  tenantCode: string | null;
  rawPayload: string;
  source: string;
  fromAddress: string | null;
  status: string;
  parseError: string | null;
  receivedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function TelemetryPage() {
  const [messages, setMessages] = useState<TelemetryMessage[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchDevice, setSearchDevice] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchMessages = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "50" });
      if (searchDevice) params.set("deviceId", searchDevice);

      const res = await fetch(`/api/admin/telemetry?${params}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setPagination(data.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 });
    } catch (error) {
      console.error("Failed to fetch telemetry:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchMessages(pagination.page), 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, pagination.page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages(1);
  };

  const statusColors: Record<string, string> = {
    processed: "border-green-200 bg-green-50 text-green-700",
    pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
    failed: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Telemetry Messages</h1>
          <p className="text-gray-500 mt-1">Real-time device data from all active devices</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Radio className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-pulse" : ""}`} />
            {autoRefresh ? "Live" : "Auto-refresh"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchMessages(pagination.page)}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by device ID..."
              value={searchDevice}
              onChange={(e) => setSearchDevice(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Messages</p>
              <p className="text-xl font-semibold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Cpu className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Processed</p>
              <p className="text-xl font-semibold text-gray-900">
                {messages.filter((m) => m.status === "processed").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-semibold text-gray-900">
                {messages.filter((m) => m.status === "pending").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Building2 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Unique Devices</p>
              <p className="text-xl font-semibold text-gray-900">
                {new Set(messages.map((m) => m.tenantDeviceId).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(msg.receivedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {msg.tenantDeviceId || msg.fromAddress || "—"}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {msg.tenantName ? (
                        <div>
                          <p className="font-medium text-gray-900">{msg.tenantName}</p>
                          <p className="text-xs text-gray-500">{msg.tenantCode}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{msg.source}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={statusColors[msg.status] || ""}>
                        {msg.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded block max-w-xs truncate">
                        {msg.rawPayload}
                      </code>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    {loading ? "Loading..." : "No telemetry messages found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchMessages(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchMessages(pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
