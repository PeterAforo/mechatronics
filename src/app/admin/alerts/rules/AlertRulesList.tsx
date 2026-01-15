"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, AlertTriangle, Settings } from "lucide-react";
import BulkDeleteTable from "@/components/admin/BulkDeleteTable";

interface AlertRule {
  id: string;
  ruleName: string;
  deviceTypeName: string;
  variableCode: string;
  operator: string;
  threshold1: number;
  threshold2: number | null;
  severity: string;
  isActive: boolean;
}

interface AlertRulesListProps {
  rules: AlertRule[];
}

const severityColors: Record<string, string> = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};

const operatorLabels: Record<string, string> = {
  lt: "<",
  lte: "≤",
  eq: "=",
  neq: "≠",
  gte: "≥",
  gt: ">",
  between: "between",
  outside: "outside",
};

export default function AlertRulesList({ rules }: AlertRulesListProps) {
  return (
    <BulkDeleteTable
      items={rules}
      deleteEndpoint="/api/admin/alerts/rules/bulk-delete"
      itemName="alert rule"
      itemNamePlural="alert rules"
      emptyState={
        <div className="p-12 text-center">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No alert rules configured</p>
          <Link href="/admin/alerts/rules/new">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Create Your First Rule
            </Button>
          </Link>
        </div>
      }
      renderItem={(rule, isSelected, onToggle) => (
        <div className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${rule.ruleName}`}
          />
          <div className="flex-1 flex items-center justify-between">
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
                  {rule.deviceTypeName} • {rule.variableCode} {operatorLabels[rule.operator]} {rule.threshold1}
                  {rule.threshold2 && ` - ${rule.threshold2}`}
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
      )}
    />
  );
}
