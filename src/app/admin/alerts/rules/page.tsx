import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, Plus, ChevronRight, AlertTriangle, Settings,
  Mail, MessageSquare, Webhook, Clock
} from "lucide-react";

export default async function AlertRulesPage() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    redirect("/login?type=admin");
  }

  const [alertRules, deviceTypes] = await Promise.all([
    prisma.alertRule.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.deviceType.findMany({
      select: { id: true, name: true, typeCode: true },
    }),
  ]);

  const deviceTypeMap = new Map(deviceTypes.map(dt => [dt.id.toString(), dt]));

  const severityColors = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    critical: "bg-red-50 text-red-700 border-red-200",
  };

  const operatorLabels: Record<string, string> = {
    lt: "Less than",
    lte: "Less than or equal",
    eq: "Equal to",
    neq: "Not equal to",
    gte: "Greater than or equal",
    gt: "Greater than",
    between: "Between",
    outside: "Outside range",
  };

  return (
    <main className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Alert Rules</h1>
          <p className="text-gray-500 mt-1">Configure automated alerts for device thresholds</p>
        </div>
        <Link href="/admin/alerts/rules/new">
          <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
            <Plus className="h-4 w-4" />
            Create Rule
          </Button>
        </Link>
      </div>

      {/* Notification Channels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Email</p>
              <p className="text-sm text-green-600">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">SMS</p>
              <p className="text-sm text-green-600">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">WhatsApp</p>
              <p className="text-sm text-gray-400">Configure</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Webhook className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Webhook</p>
              <p className="text-sm text-gray-400">Configure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Rules List */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Configured Rules</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {alertRules.length > 0 ? alertRules.map((rule) => {
            const deviceType = deviceTypeMap.get(rule.deviceTypeId.toString());
            return (
              <div
                key={rule.id.toString()}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      rule.severity === "critical" ? "bg-red-50" :
                      rule.severity === "warning" ? "bg-yellow-50" : "bg-blue-50"
                    }`}>
                      <AlertTriangle className={`h-5 w-5 ${
                        rule.severity === "critical" ? "text-red-600" :
                        rule.severity === "warning" ? "text-yellow-600" : "text-blue-600"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rule.ruleName}</p>
                      <p className="text-sm text-gray-500">
                        {deviceType?.name || "Unknown"} • {rule.variableCode} {operatorLabels[rule.operator]} {Number(rule.threshold1)}
                        {rule.threshold2 && ` - ${Number(rule.threshold2)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={severityColors[rule.severity]}>
                      {rule.severity}
                    </Badge>
                    <Badge variant="outline" className={
                      rule.isActive 
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }>
                      {rule.isActive ? "Active" : "Disabled"}
                    </Badge>
                    <Link href={`/admin/alerts/rules/${rule.id}`}>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No alert rules configured</p>
              <Link href="/admin/alerts/rules/new">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Create Your First Rule
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Escalation Settings */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Escalation Settings</h2>
          </div>
          <Button variant="outline" size="sm">Configure</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">First Escalation</p>
            <p className="font-medium text-gray-900">After 15 minutes</p>
            <p className="text-xs text-gray-400 mt-1">Notify: Team Lead</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Second Escalation</p>
            <p className="font-medium text-gray-900">After 30 minutes</p>
            <p className="text-xs text-gray-400 mt-1">Notify: Manager</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Final Escalation</p>
            <p className="font-medium text-gray-900">After 1 hour</p>
            <p className="text-xs text-gray-400 mt-1">Notify: Admin + SMS</p>
          </div>
        </div>
      </div>
    </main>
  );
}
