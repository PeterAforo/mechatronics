import prisma from "@/lib/prisma";
import OrdersList from "./OrdersList";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  const serializedOrders = orders.map((o) => ({
    id: o.id.toString(),
    orderRef: o.orderRef,
    itemCount: o.items.length,
    createdAt: o.createdAt.toISOString(),
    currency: o.currency,
    total: Number(o.total),
    status: o.status,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">View and manage customer orders</p>
        </div>
      </div>

      <OrdersList orders={serializedOrders} />
    </main>
  );
}
