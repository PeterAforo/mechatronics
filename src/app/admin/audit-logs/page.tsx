"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Shield, Search, User, Settings, FileText, Trash2, Plus, Edit } from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  tenantId: string | null;
  tenantName: string | null;
  userId: string | null;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== "all" && log.action !== actionFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(query) ||
        log.entityType.toLowerCase().includes(query) ||
        log.userEmail?.toLowerCase().includes(query) ||
        log.tenantName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "update":
        return <Edit className="h-4 w-4 text-blue-500" />;
      case "delete":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "login":
        return <User className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-700 border-green-200";
      case "update":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "delete":
        return "bg-red-100 text-red-700 border-red-200";
      case "login":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const uniqueActions = [...new Set(logs.map((l) => l.action))];

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 mt-1">Track all system activities for compliance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Logs</p>
          <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Creates</p>
          <p className="text-2xl font-bold text-green-600">
            {logs.filter((l) => l.action === "create").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Updates</p>
          <p className="text-2xl font-bold text-blue-600">
            {logs.filter((l) => l.action === "update").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Deletes</p>
          <p className="text-2xl font-bold text-red-600">
            {logs.filter((l) => l.action === "delete").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((action) => (
              <SelectItem key={action} value={action}>{action}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Logs</h3>
          <p className="text-gray-500">No audit logs match your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 flex items-start gap-4">
              {getActionIcon(log.action)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={getActionBadge(log.action)}>
                    {log.action}
                  </Badge>
                  <span className="text-sm font-medium text-gray-900">{log.entityType}</span>
                  {log.entityId && (
                    <span className="text-sm text-gray-500">#{log.entityId}</span>
                  )}
                </div>
                {log.details && (
                  <p className="text-sm text-gray-600 mb-1">{log.details}</p>
                )}
                <p className="text-xs text-gray-500">
                  {log.userEmail || "System"} 
                  {log.tenantName && ` • ${log.tenantName}`}
                  {log.ipAddress && ` • ${log.ipAddress}`}
                  {" • "}
                  {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
