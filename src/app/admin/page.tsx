import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, Users, Factory, ShoppingCart,
  Plus, Boxes, ChevronRight, BarChart3, TrendingUp, TrendingDown,
  DollarSign, Activity, Lightbulb, Sparkles
} from "lucide-react";
import { AdminDashboardCharts } from "@/components/dashboard/AdminDashboardCharts";

export default async function AdminPortalPage() {
  // Get stats
  const [productCount, tenantCount, inventoryCount, orderCount, deviceTypeCount, subscriptionCount] = await Promise.all([
    prisma.deviceProduct.count(),
    prisma.tenant.count(),
    prisma.deviceInventory.count(),
    prisma.order.count(),
    prisma.deviceType.count(),
    prisma.subscription.count({ where: { status: "active" } }),
  ]);

  // Get financial stats
  const paidOrders = await prisma.order.findMany({
    where: { status: "paid" },
    select: { total: true, currency: true, createdAt: true },
  });

  const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const thisMonthRevenue = paidOrders
    .filter(o => new Date(o.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, order) => sum + Number(order.total), 0);

  // Get monthly revenue data for chart
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleString("default", { month: "short" });
    const revenue = paidOrders
      .filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, order) => sum + Number(order.total), 0);
    return { month, revenue };
  });

  // Get subscription data for chart
  const subscriptionsByStatus = await prisma.subscription.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const subscriptionData = subscriptionsByStatus.map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s._count.status,
  }));

  // Get recent orders
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  // AI Insights (simulated based on data)
  const insights = generateInsights(tenantCount, subscriptionCount, totalRevenue, thisMonthRevenue, inventoryCount);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your IoT platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Link href="/admin/products" className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Products</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{productCount}</p>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Link>
          <Link href="/admin/device-types" className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Device Types</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{deviceTypeCount}</p>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <Factory className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </Link>
          <Link href="/admin/inventory" className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inventory</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{inventoryCount}</p>
              </div>
              <div className="p-2.5 bg-green-50 rounded-lg">
                <Boxes className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </Link>
          <Link href="/admin/tenants" className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tenants</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{tenantCount}</p>
              </div>
              <div className="p-2.5 bg-orange-50 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </Link>
          <Link href="/admin/orders" className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Orders</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{orderCount}</p>
              </div>
              <div className="p-2.5 bg-yellow-50 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/products/new" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 rounded-lg">
                <Plus className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add Product</p>
                <p className="text-xs text-gray-500">New listing</p>
              </div>
            </Link>
            <Link href="/admin/inventory/new" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-green-400 hover:bg-green-50/30 transition-colors flex items-center gap-3">
              <div className="p-2.5 bg-green-50 rounded-lg">
                <Boxes className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add Inventory</p>
                <p className="text-xs text-gray-500">New device</p>
              </div>
            </Link>
            <Link href="/admin/device-types/new" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-400 hover:bg-purple-50/30 transition-colors flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <Factory className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add Device Type</p>
                <p className="text-xs text-gray-500">New model</p>
              </div>
            </Link>
            <Link href="/admin/reports" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 transition-colors flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Reports</p>
                <p className="text-xs text-gray-500">Analytics</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <TrendingUp className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-green-100 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold mt-1">GHS {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">This Month</span>
            </div>
            <p className="text-blue-100 text-sm">Monthly Revenue</p>
            <p className="text-3xl font-bold mt-1">GHS {thisMonthRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <Badge className="bg-white/20 text-white border-0">Active</Badge>
            </div>
            <p className="text-purple-100 text-sm">Active Subscriptions</p>
            <p className="text-3xl font-bold mt-1">{subscriptionCount}</p>
          </div>
        </div>

        {/* Charts */}
        <AdminDashboardCharts 
          monthlyRevenue={monthlyRevenue} 
          subscriptionData={subscriptionData} 
        />

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Business Advisor</h2>
              <p className="text-sm text-gray-500">Insights to grow your business</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-indigo-100">
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded ${insight.type === 'success' ? 'bg-green-100' : insight.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                    <Lightbulb className={`h-4 w-4 ${insight.type === 'success' ? 'text-green-600' : insight.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{insight.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <Link 
                  key={order.id.toString()} 
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.orderRef}</p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {order.currency} {Number(order.total).toFixed(2)}
                      </p>
                      <Badge 
                        variant="outline"
                        className={
                          order.status === "paid" ? "border-green-200 bg-green-50 text-green-700" :
                          order.status === "pending" ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
                          "border-gray-200 bg-gray-50 text-gray-600"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-4">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
              <p className="text-gray-500">Orders will appear here when customers make purchases</p>
            </div>
          )}
        </div>
      </main>
  );
}

function generateInsights(
  tenantCount: number,
  subscriptionCount: number,
  totalRevenue: number,
  thisMonthRevenue: number,
  inventoryCount: number
) {
  const insights: { title: string; description: string; type: "success" | "warning" | "info" }[] = [];

  // Subscription conversion rate
  if (tenantCount > 0) {
    const conversionRate = (subscriptionCount / tenantCount) * 100;
    if (conversionRate < 50) {
      insights.push({
        title: "Improve Conversion Rate",
        description: `Only ${conversionRate.toFixed(0)}% of tenants have active subscriptions. Consider offering promotions or demos.`,
        type: "warning",
      });
    } else {
      insights.push({
        title: "Strong Conversion",
        description: `${conversionRate.toFixed(0)}% of tenants are subscribed. Keep up the great customer engagement!`,
        type: "success",
      });
    }
  }

  // Revenue trend
  if (thisMonthRevenue > 0) {
    const avgMonthlyRevenue = totalRevenue / 6;
    if (thisMonthRevenue > avgMonthlyRevenue) {
      insights.push({
        title: "Revenue Growing",
        description: "This month's revenue is above your 6-month average. Great momentum!",
        type: "success",
      });
    } else {
      insights.push({
        title: "Boost Revenue",
        description: "Revenue is below average this month. Consider marketing campaigns or upselling.",
        type: "info",
      });
    }
  }

  // Inventory management
  if (inventoryCount < 10) {
    insights.push({
      title: "Low Inventory",
      description: `Only ${inventoryCount} devices in stock. Consider restocking to meet demand.`,
      type: "warning",
    });
  } else {
    insights.push({
      title: "Inventory Healthy",
      description: `${inventoryCount} devices available. Well-stocked for upcoming orders.`,
      type: "success",
    });
  }

  // Growth opportunity
  if (tenantCount < 50) {
    insights.push({
      title: "Growth Opportunity",
      description: "Expand your reach with targeted marketing to businesses in your area.",
      type: "info",
    });
  }

  // Subscription retention
  insights.push({
    title: "Retention Focus",
    description: "Send monthly usage reports to subscribers to demonstrate value and reduce churn.",
    type: "info",
  });

  return insights.slice(0, 3);
}
