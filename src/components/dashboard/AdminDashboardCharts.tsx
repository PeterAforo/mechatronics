"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  DollarSign,
  Cpu,
  Boxes,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ShoppingCart,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: "purple" | "green" | "blue" | "orange" | "red" | "cyan";
  delay?: number;
}

const colorClasses = {
  purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100" },
  green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-100" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-100" },
  red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100" },
  cyan: { bg: "bg-cyan-50", icon: "text-cyan-600", border: "border-cyan-100" },
};

function AnimatedStatCard({ title, value, change, changeLabel, icon, color, delay = 0 }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === "number" ? value : parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  const isNumeric = typeof value === "number" || !isNaN(numericValue);
  const colors = colorClasses[color];

  useEffect(() => {
    if (!isNumeric) return;
    const duration = 1500;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [numericValue, isNumeric]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white rounded-2xl p-5 border ${colors.border} hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <div className={colors.icon}>{icon}</div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
            {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {isNumeric ? (typeof value === "string" && value.includes("GHS") ? `GHS ${displayValue.toLocaleString()}` : displayValue.toLocaleString()) : value}
        </p>
        {changeLabel && <p className="text-xs text-gray-400 mt-1">{changeLabel}</p>}
      </div>
    </motion.div>
  );
}

interface AdminDashboardChartsProps {
  stats: {
    totalCustomers: number;
    totalRevenue: number;
    totalDevices: number;
    inventoryCount: number;
    monthlySubscriptionRevenue: number;
    activeSubscriptions: number;
    pendingOrders: number;
    inactiveDevices: number;
  };
  monthlyRevenue: { month: string; revenue: number }[];
  devicesByCategory: { name: string; value: number }[];
  revenueGrowth: number;
  customerGrowth: number;
}

const COLORS = ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

export function AdminDashboardCharts({
  stats,
  monthlyRevenue = [],
  devicesByCategory = [],
  revenueGrowth,
  customerGrowth,
}: AdminDashboardChartsProps) {
  // Ensure data is always an array
  const safeMonthlyRevenue = Array.isArray(monthlyRevenue) ? monthlyRevenue : [];
  const safeDevicesByCategory = Array.isArray(devicesByCategory) ? devicesByCategory : [];
  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatedStatCard
          title="Total Customers"
          value={stats.totalCustomers}
          change={customerGrowth}
          changeLabel="vs last month"
          icon={<Users className="h-5 w-5" />}
          color="purple"
          delay={0}
        />
        <AnimatedStatCard
          title="Total Revenue"
          value={`GHS ${stats.totalRevenue}`}
          change={revenueGrowth}
          changeLabel="vs last month"
          icon={<DollarSign className="h-5 w-5" />}
          color="green"
          delay={0.1}
        />
        <AnimatedStatCard
          title="Active Devices"
          value={stats.totalDevices}
          icon={<Cpu className="h-5 w-5" />}
          color="blue"
          delay={0.2}
        />
        <AnimatedStatCard
          title="Inventory Units"
          value={stats.inventoryCount}
          icon={<Boxes className="h-5 w-5" />}
          color="orange"
          delay={0.3}
        />
        <AnimatedStatCard
          title="Monthly Subscriptions"
          value={`GHS ${stats.monthlySubscriptionRevenue}`}
          icon={<CreditCard className="h-5 w-5" />}
          color="cyan"
          delay={0.4}
        />
        <AnimatedStatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="green"
          delay={0.5}
        />
        <AnimatedStatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<ShoppingCart className="h-5 w-5" />}
          color="orange"
          delay={0.6}
        />
        <AnimatedStatCard
          title="Inactive Devices"
          value={stats.inactiveDevices}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
          delay={0.7}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
              <p className="text-sm text-gray-500">Monthly revenue overview</p>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              +{revenueGrowth}%
            </div>
          </div>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <AreaChart data={safeMonthlyRevenue}>
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
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
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

        {/* Devices by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Devices by Category</h3>
              <p className="text-sm text-gray-500">Distribution of deployed devices</p>
            </div>
          </div>
          <div className="h-64 w-full min-w-0">
            {safeDevicesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                <PieChart>
                  <Pie
                    data={safeDevicesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {safeDevicesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [Number(value), "Devices"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No device data available
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface AIAdvisorProps {
  stats: {
    totalCustomers: number;
    totalRevenue: number;
    totalDevices: number;
    inventoryCount: number;
    monthlySubscriptionRevenue: number;
    activeSubscriptions: number;
    pendingOrders: number;
    inactiveDevices: number;
  };
}

export function AIAdvisor({ stats }: AIAdvisorProps) {
  const generateRecommendations = () => {
    const recommendations: { id: string; type: "revenue" | "growth" | "warning" | "optimization"; title: string; description: string; impact: string }[] = [];

    // Revenue recommendations
    if (stats.pendingOrders > 0) {
      recommendations.push({
        id: "pending-orders",
        type: "revenue",
        title: "Process Pending Orders",
        description: `You have ${stats.pendingOrders} pending order(s). Processing these quickly can improve cash flow and customer satisfaction.`,
        impact: "High Impact",
      });
    }

    // Growth recommendations
    if (stats.inventoryCount > stats.totalDevices * 2) {
      recommendations.push({
        id: "inventory-high",
        type: "growth",
        title: "Launch Marketing Campaign",
        description: `Your inventory (${stats.inventoryCount} units) is significantly higher than deployed devices. Consider promotional offers to increase sales.`,
        impact: "Medium Impact",
      });
    }

    // Warning recommendations
    if (stats.inactiveDevices > 0) {
      recommendations.push({
        id: "inactive-devices",
        type: "warning",
        title: "Re-engage Inactive Customers",
        description: `${stats.inactiveDevices} device(s) are inactive. Reach out to these customers to understand issues and prevent churn.`,
        impact: "High Impact",
      });
    }

    // Optimization recommendations
    if (stats.activeSubscriptions > 0 && stats.totalCustomers > stats.activeSubscriptions) {
      const conversionRate = Math.round((stats.activeSubscriptions / stats.totalCustomers) * 100);
      recommendations.push({
        id: "conversion",
        type: "optimization",
        title: "Improve Subscription Conversion",
        description: `Only ${conversionRate}% of customers have active subscriptions. Consider offering trial periods or bundle discounts.`,
        impact: "High Impact",
      });
    }

    // General growth tip
    recommendations.push({
      id: "upsell",
      type: "growth",
      title: "Upsell Premium Products",
      description: "Analyze customer usage patterns and recommend premium products to customers using basic plans for increased revenue.",
      impact: "Medium Impact",
    });

    // Inventory optimization
    if (stats.inventoryCount < 10) {
      recommendations.push({
        id: "low-inventory",
        type: "warning",
        title: "Restock Inventory",
        description: `Inventory is running low (${stats.inventoryCount} units). Consider restocking to avoid stockouts and lost sales.`,
        impact: "High Impact",
      });
    }

    return recommendations.slice(0, 4);
  };

  const recommendations = generateRecommendations();

  const typeStyles = {
    revenue: { bg: "bg-green-50", border: "border-green-100", icon: <DollarSign className="h-5 w-5 text-green-600" /> },
    growth: { bg: "bg-purple-50", border: "border-purple-100", icon: <TrendingUp className="h-5 w-5 text-purple-600" /> },
    warning: { bg: "bg-amber-50", border: "border-amber-100", icon: <AlertTriangle className="h-5 w-5 text-amber-600" /> },
    optimization: { bg: "bg-blue-50", border: "border-blue-100", icon: <Lightbulb className="h-5 w-5 text-blue-600" /> },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/20 rounded-xl">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">AI Platform Advisor</h3>
          <p className="text-purple-200 text-sm">Smart recommendations to grow your business</p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 + idx * 0.1 }}
            className={`${typeStyles[rec.type].bg} ${typeStyles[rec.type].border} border rounded-xl p-4`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {typeStyles[rec.type].icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-gray-900 text-sm">{rec.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    rec.impact === "High Impact" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {rec.impact}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
