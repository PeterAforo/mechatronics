import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, ChevronRight, Calendar, CreditCard } from "lucide-react";

export default async function SubscriptionsPage() {
  const session = await auth();
  
  if (!session?.user || session.user.userType !== "tenant") {
    redirect("/login");
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;

  const subscriptions = tenantId ? await prisma.subscription.findMany({
    where: { tenantId },
    include: {
      product: true,
      tenantDevices: {
        include: {
          inventory: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  }) : [];

  const activeCount = subscriptions.filter(s => s.status === "active").length;
  const totalMonthly = subscriptions
    .filter(s => s.status === "active")
    .reduce((sum, s) => sum + Number(s.monthlyFee), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Subscriptions</h1>
          <p className="text-gray-500">Manage your device subscriptions</p>
        </div>
        <Link href="/products">
          <Button className="bg-[#f74780] hover:bg-[#e03a6f]">
            <Plus className="h-4 w-4 mr-2" />
            New Subscription
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{activeCount}</p>
              <p className="text-sm text-gray-500">Active Subscriptions</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                GHS {totalMonthly.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Monthly Total</p>
            </div>
          </div>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions yet</h3>
          <p className="text-gray-500 mb-4">Get started by ordering your first IoT device</p>
          <Link href="/products">
            <Button className="bg-[#f74780] hover:bg-[#e03a6f]">
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <div 
              key={sub.id.toString()} 
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-[#f74780] to-[#ff6b9d] rounded-xl">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{sub.product?.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {sub.tenantDevices.length} device{sub.tenantDevices.length !== 1 ? "s" : ""} connected
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Started {new Date(sub.startDate).toLocaleDateString()}</span>
                      </div>
                      {sub.nextBillingDate && (
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          <span>Next billing {new Date(sub.nextBillingDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="outline"
                      className={sub.status === "active" 
                        ? "border-green-200 bg-green-50 text-green-700" 
                        : sub.status === "suspended"
                        ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                        : "border-gray-200 text-gray-600"
                      }
                    >
                      {sub.status}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {sub.currency} {Number(sub.monthlyFee).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">per {sub.billingInterval}</p>
                </div>
              </div>
              {sub.tenantDevices.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">Connected Devices:</p>
                  <div className="flex flex-wrap gap-2">
                    {sub.tenantDevices.map((device) => (
                      <Link 
                        key={device.id.toString()} 
                        href={`/portal/devices/${device.id}`}
                      >
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                          {device.inventory?.serialNumber || `Device ${device.id}`}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
