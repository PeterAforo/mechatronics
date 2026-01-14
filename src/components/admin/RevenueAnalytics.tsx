"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  RefreshCw,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface RevenueAnalyticsProps {
  totalRevenue: number;
  mrr: number;
  arr: number;
  ltv: number;
  churnRate: number;
  revenueGrowth: number;
  customerGrowth: number;
  monthlyData: { month: string; revenue: number; orders: number }[];
  revenueByProduct: { name: string; value: number }[];
  totalCustomers: number;
  activeSubscriptions: number;
}

const COLORS = ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

export function RevenueAnalytics({
  totalRevenue,
  mrr,
  arr,
  ltv,
  churnRate,
  revenueGrowth,
  customerGrowth,
  monthlyData,
  revenueByProduct,
  totalCustomers,
  activeSubscriptions,
}: RevenueAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {revenueGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(revenueGrowth)}%
            </div>
          </div>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">GHS {totalRevenue.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <RefreshCw className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Monthly Recurring (MRR)</p>
          <p className="text-2xl font-bold text-gray-900">GHS {mrr.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Annual Recurring (ARR)</p>
          <p className="text-2xl font-bold text-gray-900">GHS {arr.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Customer LTV</p>
          <p className="text-2xl font-bold text-gray-900">GHS {ltv.toFixed(0)}</p>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Customers</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xl font-bold text-gray-900">{totalCustomers}</p>
            <div className={`flex items-center gap-1 text-sm ${customerGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {customerGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(customerGrowth)}%
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Active Subscriptions</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{activeSubscriptions}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Churn Rate</p>
          <p className={`text-xl font-bold mt-1 ${churnRate > 5 ? "text-red-600" : "text-green-600"}`}>
            {churnRate}%
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Avg Revenue/Customer</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            GHS {totalCustomers > 0 ? (totalRevenue / totalCustomers).toFixed(0) : 0}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `₵${v}`} />
                <Tooltip
                  formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, "Revenue"]}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Orders Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-100"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Orders by Month</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  formatter={(value) => [Number(value), "Orders"]}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px" }}
                />
                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Revenue by Product */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 border border-gray-100"
      >
        <h3 className="font-semibold text-gray-900 mb-4">Revenue by Product</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            {revenueByProduct.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByProduct}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueByProduct.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, "Revenue"]}
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No product data available
              </div>
            )}
          </div>
          <div className="space-y-3">
            {revenueByProduct.map((product, idx) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-700">GHS {product.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
