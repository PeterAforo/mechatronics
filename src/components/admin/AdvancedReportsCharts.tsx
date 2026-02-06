"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

interface CategoryData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface AdvancedReportsChartsProps {
  revenueData: RevenueData[];
  categoryData: CategoryData[];
  subscriptionData: { status: string; count: number }[];
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
}

const COLORS = ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

export function AdvancedReportsCharts({
  revenueData,
  categoryData,
  subscriptionData,
  totalRevenue,
  totalOrders,
  avgOrderValue,
  revenueGrowth,
  orderGrowth,
}: AdvancedReportsChartsProps) {
  const [dateRange, setDateRange] = useState("30d");
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: "pdf" | "csv" | "excel") => {
    setExporting(true);
    try {
      const response = await fetch(`/api/admin/reports/export?format=${format}&range=${dateRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `platform_report_${Date.now()}.${format === "excel" ? "xls" : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
    setExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
            disabled={exporting}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
            disabled={exporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("excel")}
            disabled={exporting}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-gray-100"
        >
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">GHS {totalRevenue.toLocaleString()}</p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
            {revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(revenueGrowth)}% vs last period
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-gray-100"
        >
          <p className="text-sm text-gray-500 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${orderGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
            {orderGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(orderGrowth)}% vs last period
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-gray-100"
        >
          <p className="text-sm text-gray-500 mb-1">Avg Order Value</p>
          <p className="text-2xl font-bold text-gray-900">GHS {avgOrderValue.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-2">Per transaction</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 border border-gray-100"
        >
          <p className="text-sm text-gray-500 mb-1">MRR</p>
          <p className="text-2xl font-bold text-gray-900">
            GHS {Math.round(totalRevenue * 0.3).toLocaleString()}
          </p>
          <p className="text-sm text-gray-400 mt-2">Monthly recurring</p>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <AreaChart data={Array.isArray(revenueData) ? revenueData : []}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `₵${v}`} />
                <Tooltip
                  formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Orders Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Orders Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <BarChart data={Array.isArray(revenueData) ? revenueData : []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  formatter={(value) => [Number(value), "Orders"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Revenue by Category</h3>
          <div className="h-72">
            {Array.isArray(categoryData) && categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No category data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Subscription Status</h3>
          <div className="h-72">
            {Array.isArray(subscriptionData) && subscriptionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={subscriptionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis dataKey="status" type="category" tick={{ fontSize: 12 }} stroke="#9ca3af" width={80} />
                  <Tooltip
                    formatter={(value) => [Number(value), "Subscriptions"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No subscription data available
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
