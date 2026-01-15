import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { AdminDashboardCharts, AIAdvisor } from "@/components/dashboard/AdminDashboardCharts";
import { 
  ShoppingCart, ChevronRight, Clock, Wifi, WifiOff,
  CheckCircle2, AlertTriangle, Package
} from "lucide-react";

export default async function AdminPortalPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login?type=admin");
  }

  if (session.user.userType !== "admin") {
    redirect("/login?type=admin");
  }

  // Get comprehensive stats
  const [
    tenantCount,
    inventoryCount,
    activeSubscriptionCount,
    pendingOrderCount,
    totalOrderCount,
    allDevices,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.deviceInventory.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count(),
    prisma.tenantDevice.findMany({
      where: { status: "active" },
      select: { id: true, lastSeenAt: true },
    }),
  ]);

  // Calculate online/offline based on telemetry activity (3-hour threshold)
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  
  const activeDeviceCount = allDevices.filter(d => d.lastSeenAt && d.lastSeenAt >= threeHoursAgo).length;
  const inactiveDeviceCount = allDevices.filter(d => !d.lastSeenAt || d.lastSeenAt < threeHoursAgo).length;

  // Get total revenue from paid orders
  const paidOrders = await prisma.order.findMany({
    where: { status: "paid" },
    select: { total: true },
  });
  const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0);

  // Get monthly subscription revenue
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: "active" },
    select: { monthlyFee: true },
  });
  const monthlySubscriptionRevenue = activeSubscriptions.reduce((sum, sub) => sum + Number(sub.monthlyFee), 0);

  // Get devices by category for pie chart
  const devicesByCategory = await prisma.tenantDevice.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  // Get device types for category breakdown
  const deviceTypes = await prisma.deviceType.findMany({
    select: { category: true },
  });
  const categoryCount: Record<string, number> = {};
  deviceTypes.forEach(dt => {
    const cat = dt.category || "other";
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  // Monthly revenue data (last 6 months - simulated based on actual data)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthlyRevenue = months.map((month, idx) => ({
    month,
    revenue: Math.round(totalRevenue * (0.6 + Math.random() * 0.4) / 6 * (idx + 1) / 3),
  }));

  // Today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: today },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      items: { include: { product: true } },
    },
  });

  // Recent orders (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: weekAgo },
      status: { not: "pending" },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      items: { include: { product: true } },
    },
  });

  // Pending orders
  const pendingOrdersList = await prisma.order.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      items: { include: { product: true } },
    },
  });

  // Inactive devices
  const inactiveDevicesList = await prisma.tenantDevice.findMany({
    where: { status: { not: "active" } },
    take: 5,
    include: {
      inventory: { include: { deviceType: true } },
      subscription: { include: { product: true } },
    },
  });

  // Stats object for charts
  const stats = {
    totalCustomers: tenantCount,
    totalRevenue: Math.round(totalRevenue),
    totalDevices: activeDeviceCount,
    inventoryCount,
    monthlySubscriptionRevenue: Math.round(monthlySubscriptionRevenue),
    activeSubscriptions: activeSubscriptionCount,
    pendingOrders: pendingOrderCount,
    inactiveDevices: inactiveDeviceCount,
  };

  // Device category data for pie chart
  const devicesByCategoryData = Object.entries(categoryCount).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Growth calculations (simulated - in production, compare with previous period)
  const revenueGrowth = 12;
  const customerGrowth = 8;

  return (
    <main className="p-4 md:p-6 space-y-6">
      {/* Stats Cards and Charts */}
      <AdminDashboardCharts
        stats={stats}
        monthlyRevenue={monthlyRevenue}
        devicesByCategory={devicesByCategoryData}
        revenueGrowth={revenueGrowth}
        customerGrowth={customerGrowth}
      />

      {/* Orders and AI Advisor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Orders */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Orders */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Today&apos;s Orders</h3>
                <p className="text-sm text-gray-500">{todaysOrders.length} order(s) today</p>
              </div>
              <Link href="/admin/orders" className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {todaysOrders.length > 0 ? todaysOrders.map((order) => (
                <Link 
                  key={order.id.toString()}
                  href={`/admin/orders/${order.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      order.status === "paid" ? "bg-green-100" :
                      order.status === "pending" ? "bg-yellow-100" :
                      "bg-gray-100"
                    }`}>
                      <ShoppingCart className={`h-5 w-5 ${
                        order.status === "paid" ? "text-green-600" :
                        order.status === "pending" ? "text-yellow-600" :
                        "text-gray-600"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.orderRef}</p>
                      <p className="text-xs text-gray-500">
                        {order.items.map(i => i.product.name).join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.currency} {Number(order.total).toFixed(0)}</p>
                    </div>
                    <Badge variant="outline" className={
                      order.status === "paid" ? "bg-green-50 text-green-700 border-green-200" :
                      order.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                      "bg-gray-50 text-gray-700 border-gray-200"
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </Link>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p>No orders today yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent & Pending Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Completed
                </Badge>
              </div>
              <div className="space-y-3">
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <Link 
                    key={order.id.toString()}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{order.orderRef}</p>
                        <p className="text-xs text-gray-500">{order.currency} {Number(order.total).toFixed(0)}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                )) : (
                  <p className="text-center py-4 text-gray-500 text-sm">No recent orders</p>
                )}
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Pending Orders</h3>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {pendingOrdersList.length} Pending
                </Badge>
              </div>
              <div className="space-y-3">
                {pendingOrdersList.length > 0 ? pendingOrdersList.map((order) => (
                  <Link 
                    key={order.id.toString()}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{order.orderRef}</p>
                        <p className="text-xs text-gray-500">{order.currency} {Number(order.total).toFixed(0)}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                )) : (
                  <p className="text-center py-4 text-gray-500 text-sm">No pending orders</p>
                )}
              </div>
            </div>
          </div>

          {/* Inactive Devices */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Inactive Devices</h3>
                <p className="text-sm text-gray-500">Devices requiring attention</p>
              </div>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {inactiveDevicesList.length} Inactive
              </Badge>
            </div>
            <div className="space-y-3">
              {inactiveDevicesList.length > 0 ? inactiveDevicesList.map((device) => (
                <div 
                  key={device.id.toString()}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-100">
                      <WifiOff className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {device.nickname || device.subscription?.product?.name || `Device ${device.id}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {device.inventory?.serialNumber || "No serial"} • {device.inventory?.deviceType?.name || "Unknown type"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                    {device.status}
                  </Badge>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Wifi className="h-10 w-10 text-green-300 mx-auto mb-3" />
                  <p>All devices are active</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - AI Advisor */}
        <div className="lg:col-span-4 space-y-6">
          <AIAdvisor stats={stats} />

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                href="/admin/orders"
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">Process Orders</span>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
              </Link>
              <Link 
                href="/admin/inventory"
                className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
              >
                <Package className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">Manage Inventory</span>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
              </Link>
              <Link 
                href="/admin/tenants"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">View Customers</span>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
              </Link>
              <Link 
                href="/admin/reports"
                className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">View Reports</span>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
