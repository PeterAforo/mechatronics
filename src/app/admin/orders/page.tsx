import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ShoppingCart } from "lucide-react";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  const statusColors: Record<string, string> = {
    pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
    paid: "border-green-200 bg-green-50 text-green-700",
    cancelled: "border-red-200 bg-red-50 text-red-700",
    refunded: "border-gray-200 bg-gray-50 text-gray-600",
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">View and manage customer orders</p>
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {orders.map((order) => (
            <Link
              key={order.id.toString()}
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-yellow-50 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.orderRef}</p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {order.currency} {Number(order.total).toFixed(2)}
                  </p>
                </div>
                <Badge variant="outline" className={statusColors[order.status] || statusColors.pending}>
                  {order.status}
                </Badge>
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
    </main>
  );
}
