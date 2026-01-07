import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, ShoppingCart, Package, Boxes } from "lucide-react";

export default async function ReportsPage() {
  const [
    totalProducts,
    totalTenants,
    totalOrders,
    totalInventory,
    recentOrders,
  ] = await Promise.all([
    prisma.deviceProduct.count(),
    prisma.tenant.count(),
    prisma.order.count(),
    prisma.deviceInventory.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const paidOrders = recentOrders.filter(o => o.status === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Overview of your platform performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">GHS {totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalOrders}</p>
            </div>
            <div className="p-2.5 bg-yellow-50 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Tenants</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalTenants}</p>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Devices in Stock</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalInventory}</p>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <Boxes className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Orders Overview</h2>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chart visualization coming soon</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Products Listed</p>
            <p className="text-xl font-semibold text-gray-900">{totalProducts}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Paid Orders</p>
            <p className="text-xl font-semibold text-gray-900">{paidOrders.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Avg Order Value</p>
            <p className="text-xl font-semibold text-gray-900">
              GHS {paidOrders.length > 0 ? (totalRevenue / paidOrders.length).toFixed(2) : "0.00"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Inventory Units</p>
            <p className="text-xl font-semibold text-gray-900">{totalInventory}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
