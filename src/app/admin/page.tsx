import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, Users, Factory, ShoppingCart,
  Plus, Boxes, ChevronRight, BarChart3
} from "lucide-react";

export default async function AdminPortalPage() {
  // Get stats
  const [productCount, tenantCount, inventoryCount, orderCount, deviceTypeCount] = await Promise.all([
    prisma.deviceProduct.count(),
    prisma.tenant.count(),
    prisma.deviceInventory.count(),
    prisma.order.count(),
    prisma.deviceType.count(),
  ]);

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
            <Link href="/admin/products/new" className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#f74780] hover:bg-pink-50/30 transition-colors flex items-center gap-3">
              <div className="p-2.5 bg-[#f74780]/10 rounded-lg">
                <Plus className="h-5 w-5 text-[#f74780]" />
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
