import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { 
  Bell, Plus, Mail, MessageSquare, Webhook, Clock
} from "lucide-react";
import AlertRulesList from "./AlertRulesList";

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

  const serializedRules = alertRules.map((rule) => ({
    id: rule.id.toString(),
    ruleName: rule.ruleName,
    deviceTypeName: deviceTypeMap.get(rule.deviceTypeId.toString())?.name || "Unknown",
    variableCode: rule.variableCode,
    operator: rule.operator,
    threshold1: Number(rule.threshold1),
    threshold2: rule.threshold2 ? Number(rule.threshold2) : null,
    severity: rule.severity,
    isActive: rule.isActive,
  }));

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
        <AlertRulesList rules={serializedRules} />
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
