import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Package, Calendar, CreditCard } from "lucide-react";
import OrderActions from "./OrderActions";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const order = await prisma.order.findUnique({
    where: { id: BigInt(id) },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: order.tenantId },
  });

  const statusColors: Record<string, string> = {
    pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
    paid: "border-green-200 bg-green-50 text-green-700",
    cancelled: "border-red-200 bg-red-50 text-red-700",
    refunded: "border-gray-200 bg-gray-50 text-gray-600",
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/orders" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-xl">
              <ShoppingCart className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{order.orderRef}</h1>
              <p className="text-gray-500">
                {tenant?.companyName || "Unknown Tenant"}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={statusColors[order.status] || statusColors.pending}>
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id.toString()} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} • Setup: {order.currency} {Number(item.setupFee).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {order.currency} {Number(item.lineTotal).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Created on {new Date(order.createdAt).toLocaleString()}</span>
              </div>
              {order.paidAt && (
                <div className="flex items-center gap-3 text-green-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Paid on {new Date(order.paidAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{order.currency} {Number(order.subtotal).toFixed(2)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>-{order.currency} {Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              {Number(order.tax) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{order.currency} {Number(order.tax).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>{order.currency} {Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.paymentProvider && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Provider</span>
                  <span className="text-gray-900 capitalize">{order.paymentProvider}</span>
                </div>
                {order.paymentProviderRef && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reference</span>
                    <span className="text-gray-900 font-mono text-xs">{order.paymentProviderRef}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Actions */}
          <OrderActions 
            orderId={order.id.toString()}
            status={order.status}
            total={order.total.toString()}
            currency={order.currency}
          />
        </div>
      </div>
    </main>
  );
}
