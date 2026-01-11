import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { 
  Package, Users, Factory, ShoppingCart,
  ChevronRight, Star, Droplets, Zap, Thermometer,
  TrendingUp, Clock, CheckCircle2
} from "lucide-react";

export default async function AdminPortalPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login?type=admin");
  }

  if (session.user.userType !== "admin") {
    redirect("/login?type=admin");
  }

  // Get stats
  const [productCount, tenantCount, inventoryCount, orderCount, deviceTypeCount, subscriptionCount] = await Promise.all([
    prisma.deviceProduct.count(),
    prisma.tenant.count(),
    prisma.deviceInventory.count(),
    prisma.order.count(),
    prisma.deviceType.count(),
    prisma.subscription.count({ where: { status: "active" } }),
  ]);

  // Get products for display
  const products = await prisma.deviceProduct.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  // Get recent orders
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  // Get recent tenants
  const recentTenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  // Weekly activity data (simulated)
  const weeklyActivity = [
    { day: "Sun", value: 20 },
    { day: "Mon", value: 45 },
    { day: "Tue", value: 35 },
    { day: "Wed", value: 60 },
    { day: "Thu", value: 50 },
    { day: "Fri", value: 75 },
    { day: "Sat", value: 40 },
  ];

  // Daily tasks
  const dailyTasks = [
    { id: 1, title: "Device Provisioning", count: inventoryCount, icon: "device", color: "purple" },
    { id: 2, title: "Tenant Onboarding", count: tenantCount, icon: "users", color: "blue" },
    { id: 3, title: "Order Processing", count: orderCount, icon: "orders", color: "green" },
    { id: 4, title: "Subscription Management", count: subscriptionCount, icon: "subscription", color: "orange" },
  ];


  // Active tasks/alerts
  const activeTasks = [
    { id: 1, title: "Firmware Updates", subtitle: `${deviceTypeCount} device types`, status: "in_progress" },
    { id: 2, title: "Inventory Check", subtitle: `${inventoryCount} units`, status: "in_progress" },
    { id: 3, title: "Order Fulfillment", subtitle: `${orderCount} orders`, status: "in_progress" },
  ];

  const categoryIcons: Record<string, React.ReactNode> = {
    water: <Droplets className="h-5 w-5 text-blue-500" />,
    power: <Zap className="h-5 w-5 text-yellow-500" />,
    environment: <Thermometer className="h-5 w-5 text-red-500" />,
  };

  return (
    <main className="p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Main Content */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Products Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Latest Products</h2>
              <Link href="/admin/products" className="text-purple-600 text-sm font-medium hover:text-purple-700">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.length > 0 ? products.map((product) => (
                <Link 
                  key={product.id.toString()} 
                  href={`/admin/products/${product.id}`}
                  className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 bg-purple-50 rounded-xl">
                      {categoryIcons[product.category] || <Package className="h-5 w-5 text-purple-500" />}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">4.9</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      IoT Device
                    </span>
                  </div>
                </Link>
              )) : (
                <div className="col-span-3 bg-white rounded-2xl p-8 border border-gray-100 text-center">
                  <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No products yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity & Tasks Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hours Activity Chart */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Weekly Activity</h3>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +9% increased from last week
                  </p>
                </div>
                <select className="text-sm text-gray-500 bg-gray-50 border-0 rounded-lg px-2 py-1">
                  <option>weekly</option>
                  <option>monthly</option>
                </select>
              </div>
              <div className="space-y-3">
                {weeklyActivity.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-8">{item.day}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Schedule */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Platform Overview</h3>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {dailyTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.color === "purple" ? "bg-purple-500" :
                        task.color === "blue" ? "bg-blue-500" :
                        task.color === "green" ? "bg-green-500" :
                        "bg-orange-500"
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.count} items</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Orders</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
                <Link href="/admin/orders" className="p-1 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <Link 
                  key={order.id.toString()}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
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
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold text-gray-900">{order.currency} {Number(order.total).toFixed(0)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          order.status === "paid" ? "bg-green-500 w-full" :
                          order.status === "pending" ? "bg-yellow-500 w-1/2" :
                          "bg-gray-400 w-1/4"
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {order.status === "paid" ? "100%" : order.status === "pending" ? "50%" : "25%"}
                    </span>
                  </div>
                </Link>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Premium Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-900">Mechatronics</span>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full border-2 border-white flex items-center justify-center">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Platform Stats</h3>
            <p className="text-sm text-gray-500 mb-4">
              Manage {tenantCount} tenants with {subscriptionCount} active subscriptions
            </p>
            <Link 
              href="/admin/reports"
              className="block w-full py-2.5 bg-purple-600 text-white text-center rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              View Reports
            </Link>
          </div>

          {/* Calendar */}
          <CalendarWidget />

          {/* Active Tasks */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Active Tasks</h3>
              <Link href="/admin/alerts" className="p-1 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {task.status === "in_progress" ? (
                      <Clock className="h-4 w-4 text-purple-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.subtitle}</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                    In Progress
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
