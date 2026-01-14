import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Code, Key, ExternalLink, Copy, ChevronRight,
  Cpu, Activity, Bell, FileText, Webhook
} from "lucide-react";

export default async function ApiDocsPage() {
  const session = await auth();
  if (!session?.user || session.user.userType !== "admin") {
    redirect("/login?type=admin");
  }

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/devices",
      description: "List all devices for the authenticated tenant",
      scopes: ["read", "devices:read"],
    },
    {
      method: "GET",
      path: "/api/v1/telemetry",
      description: "Retrieve telemetry data with filtering options",
      scopes: ["read", "telemetry:read"],
    },
    {
      method: "POST",
      path: "/api/v1/telemetry",
      description: "Submit new telemetry readings",
      scopes: ["write", "telemetry:write"],
    },
    {
      method: "GET",
      path: "/api/v1/alerts",
      description: "List alerts with status and severity filters",
      scopes: ["read", "alerts:read"],
    },
    {
      method: "PATCH",
      path: "/api/v1/alerts",
      description: "Update alert status (acknowledge/resolve)",
      scopes: ["write", "alerts:write"],
    },
    {
      method: "GET",
      path: "/api/v1/reports",
      description: "Generate analytics reports",
      scopes: ["read", "reports:read"],
    },
    {
      method: "GET",
      path: "/api/v1/webhooks",
      description: "List configured webhooks",
      scopes: ["read", "webhooks:read"],
    },
    {
      method: "POST",
      path: "/api/v1/webhooks",
      description: "Register a new webhook endpoint",
      scopes: ["write", "webhooks:write"],
    },
  ];

  const methodColors: Record<string, string> = {
    GET: "bg-green-100 text-green-700",
    POST: "bg-blue-100 text-blue-700",
    PATCH: "bg-yellow-100 text-yellow-700",
    DELETE: "bg-red-100 text-red-700",
  };

  return (
    <main className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">API Documentation</h1>
          <p className="text-gray-500 mt-1">REST API reference for integrations</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/api/v1/docs" target="_blank">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              OpenAPI Spec
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
              <Key className="h-4 w-4" />
              Manage API Keys
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
        <h2 className="text-lg font-semibold mb-2">Quick Start</h2>
        <p className="text-purple-100 mb-4">
          Authenticate your API requests using Bearer token authentication.
        </p>
        <div className="bg-black/20 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <code>
            curl -H &quot;Authorization: Bearer YOUR_API_KEY&quot; \<br />
            &nbsp;&nbsp;https://api.mechatronics.com/api/v1/devices
          </code>
        </div>
      </div>

      {/* Base URL */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Base URL</h2>
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
          <Code className="h-5 w-5 text-gray-400" />
          <code className="text-sm font-mono text-gray-700 flex-1">
            https://homebot-next.vercel.app/api/v1
          </code>
          <Button variant="ghost" size="sm">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Endpoints */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">API Endpoints</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {endpoints.map((endpoint, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Badge className={`${methodColors[endpoint.method]} font-mono text-xs`}>
                    {endpoint.method}
                  </Badge>
                  <div>
                    <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                    <p className="text-sm text-gray-500 mt-1">{endpoint.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">Scopes:</span>
                      {endpoint.scopes.map((scope) => (
                        <Badge key={scope} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Limits */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Rate Limits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Basic Plan</p>
            <p className="text-xl font-bold text-gray-900">100 req/min</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-600">Pro Plan</p>
            <p className="text-xl font-bold text-purple-700">1,000 req/min</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Enterprise</p>
            <p className="text-xl font-bold text-gray-900">Unlimited</p>
          </div>
        </div>
      </div>

      {/* Webhook Events */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Webhook className="h-5 w-5 text-purple-600" />
          <h2 className="font-semibold text-gray-900">Webhook Events</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            "device.online",
            "device.offline",
            "alert.created",
            "alert.resolved",
            "telemetry.received",
            "subscription.created",
            "subscription.cancelled",
            "order.paid",
          ].map((event) => (
            <div key={event} className="p-3 bg-gray-50 rounded-lg">
              <code className="text-xs font-mono text-gray-700">{event}</code>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
