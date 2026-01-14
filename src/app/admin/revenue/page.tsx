import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { RevenueAnalytics } from "@/components/admin/RevenueAnalytics";

export default async function RevenuePage() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    redirect("/login?type=admin");
  }

  // Get revenue data
  const [orders, subscriptions, tenants] = await Promise.all([
    prisma.order.findMany({
      where: { status: "paid" },
      orderBy: { paidAt: "desc" },
      include: { items: { include: { product: true } } },
    }),
    prisma.subscription.findMany({
      where: { status: "active" },
      include: { product: true },
    }),
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const mrr = subscriptions.reduce((sum, s) => sum + Number(s.monthlyFee), 0);
  const arr = mrr * 12;

  // Monthly revenue breakdown
  const monthlyRevenue: Record<string, number> = {};
  const monthlyOrders: Record<string, number> = {};
  
  orders.forEach(order => {
    if (order.paidAt) {
      const month = order.paidAt.toISOString().slice(0, 7);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(order.total);
      monthlyOrders[month] = (monthlyOrders[month] || 0) + 1;
    }
  });

  // Get last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    const monthName = date.toLocaleDateString("en-US", { month: "short" });
    months.push({
      month: monthName,
      revenue: monthlyRevenue[monthKey] || 0,
      orders: monthlyOrders[monthKey] || 0,
    });
  }

  // Revenue by product
  const productRevenue: Record<string, number> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const name = item.product.name;
      productRevenue[name] = (productRevenue[name] || 0) + Number(item.lineTotal);
    });
  });

  const revenueByProduct = Object.entries(productRevenue)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Customer growth
  const customersByMonth: Record<string, number> = {};
  tenants.forEach(tenant => {
    const month = tenant.createdAt.toISOString().slice(0, 7);
    customersByMonth[month] = (customersByMonth[month] || 0) + 1;
  });

  // Calculate growth rates
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);
  
  const currentRevenue = monthlyRevenue[currentMonth] || 0;
  const previousRevenue = monthlyRevenue[lastMonth] || 1;
  const revenueGrowth = Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100);

  const currentCustomers = customersByMonth[currentMonth] || 0;
  const previousCustomers = customersByMonth[lastMonth] || 1;
  const customerGrowth = Math.round(((currentCustomers - previousCustomers) / Math.max(previousCustomers, 1)) * 100);

  // Churn calculation (simplified)
  const cancelledSubs = await prisma.subscription.count({ where: { status: "cancelled" } });
  const totalSubs = subscriptions.length + cancelledSubs;
  const churnRate = totalSubs > 0 ? Math.round((cancelledSubs / totalSubs) * 100) : 0;

  // LTV calculation
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const avgCustomerLifespan = 24; // months (assumed)
  const ltv = avgOrderValue * (avgCustomerLifespan / 12);

  return (
    <main className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Revenue Analytics</h1>
        <p className="text-gray-500 mt-1">Track your business performance and growth metrics</p>
      </div>

      <RevenueAnalytics
        totalRevenue={totalRevenue}
        mrr={mrr}
        arr={arr}
        ltv={ltv}
        churnRate={churnRate}
        revenueGrowth={revenueGrowth}
        customerGrowth={customerGrowth}
        monthlyData={months}
        revenueByProduct={revenueByProduct}
        totalCustomers={tenants.length}
        activeSubscriptions={subscriptions.length}
      />
    </main>
  );
}
