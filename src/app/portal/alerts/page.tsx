import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

export default async function AlertsPage() {
  const session = await auth();
  
  if (!session?.user || session.user.userType !== "tenant") {
    redirect("/login");
  }

  const tenantId = session.user.tenantId ? BigInt(session.user.tenantId) : null;

  const alerts = tenantId ? await prisma.alert.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  }) : [];

  const openAlerts = alerts.filter(a => a.status === "open");
  const acknowledgedAlerts = alerts.filter(a => a.status === "acknowledged");
  const resolvedAlerts = alerts.filter(a => a.status === "resolved");

  const severityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    critical: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const severityColors: Record<string, string> = {
    critical: "border-red-200 bg-red-50 text-red-700",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Alerts</h1>
          <p className="text-sm sm:text-base text-gray-500">Monitor and manage device alerts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{openAlerts.length}</p>
              <p className="text-sm text-gray-500">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Bell className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{acknowledgedAlerts.length}</p>
              <p className="text-sm text-gray-500">Acknowledged</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{resolvedAlerts.length}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All clear!</h3>
          <p className="text-gray-500">No alerts at this time. Your devices are operating normally.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {alerts.map((alert) => {
              const Icon = severityIcons[alert.severity] || Info;
              return (
                <div key={alert.id.toString()} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        alert.severity === "critical" ? "bg-red-50" :
                        alert.severity === "warning" ? "bg-yellow-50" :
                        "bg-blue-50"
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          alert.severity === "critical" ? "text-red-600" :
                          alert.severity === "warning" ? "text-yellow-600" :
                          "text-blue-600"
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{alert.title}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 ml-11 sm:ml-0">
                      <Badge variant="outline" className={`text-xs ${severityColors[alert.severity]}`}>
                        {alert.severity}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={`text-xs ${
                          alert.status === "open" ? "border-red-200 bg-red-50 text-red-700" :
                          alert.status === "acknowledged" ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
                          "border-green-200 bg-green-50 text-green-700"
                        }`}
                      >
                        {alert.status}
                      </Badge>
                      {alert.status === "open" && (
                        <Button variant="outline" size="sm" className="text-xs">
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
