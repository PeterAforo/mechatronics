import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Receipt, Calendar, CheckCircle2 } from "lucide-react";

export default async function BillingPage() {
  const session = await auth();
  
  if (!session?.user || session.user.userType !== "tenant") {
    redirect("/login");
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;

  // Get active subscriptions for billing summary
  const subscriptions = tenantId ? await prisma.subscription.findMany({
    where: { tenantId, status: "active" },
    include: { product: true },
  }) : [];

  // Get orders for invoice history
  const orders = tenantId ? await prisma.order.findMany({
    where: { tenantId },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  }) : [];

  const totalMonthly = subscriptions.reduce((sum, s) => sum + Number(s.monthlyFee), 0);
  const nextBillingDate = subscriptions
    .filter(s => s.nextBillingDate)
    .sort((a, b) => new Date(a.nextBillingDate!).getTime() - new Date(b.nextBillingDate!).getTime())[0]
    ?.nextBillingDate;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
          <p className="text-gray-500">Manage your billing and invoices</p>
        </div>
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Monthly Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">GHS {totalMonthly.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{subscriptions.length} active subscription{subscriptions.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Next Billing Date</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {nextBillingDate ? new Date(nextBillingDate).toLocaleDateString() : "-"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {nextBillingDate ? `in ${Math.ceil((new Date(nextBillingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days` : "No upcoming bills"}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-500">Payment Status</span>
          </div>
          <p className="text-3xl font-bold text-green-600">Current</p>
          <p className="text-sm text-gray-500 mt-1">All payments up to date</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">No payment method on file</p>
              <p className="text-sm text-gray-500">Add a payment method to enable automatic billing</p>
            </div>
          </div>
          <Button variant="outline">Add Payment Method</Button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
        </div>
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id.toString()} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">#{order.id.toString().padStart(5, "0")}</p>
                    <p className="text-sm text-gray-500">
                      {order.items.map(i => i.product?.name).join(", ")}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {order.currency} {Number(order.total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant="outline"
                      className={
                        order.status === "paid" ? "border-green-200 bg-green-50 text-green-700" :
                        order.status === "pending" ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
                        order.status === "cancelled" ? "border-red-200 bg-red-50 text-red-700" :
                        "border-gray-200 text-gray-600"
                      }
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Invoice
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
