import { NextRequest, NextResponse } from "next/server";

const apiDocs = {
  openapi: "3.0.0",
  info: {
    title: "Mechatronics IoT Platform API",
    version: "1.0.0",
    description: "REST API for managing IoT devices, telemetry data, alerts, and reports.",
  },
  servers: [
    { url: "/api/v1", description: "API v1" },
  ],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "API Key authentication. Get your API key from the portal.",
      },
    },
  },
  paths: {
    "/devices": {
      get: {
        summary: "List devices",
        description: "Get all devices for the authenticated tenant",
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["active", "inactive", "suspended"] } },
          { name: "limit", in: "query", schema: { type: "integer", default: 50, maximum: 100 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          200: { description: "List of devices" },
          401: { description: "Invalid API key" },
          403: { description: "Insufficient permissions" },
        },
      },
    },
    "/telemetry": {
      get: {
        summary: "Get telemetry data",
        description: "Retrieve telemetry readings for devices",
        parameters: [
          { name: "deviceId", in: "query", schema: { type: "string" } },
          { name: "variable", in: "query", schema: { type: "string" } },
          { name: "startDate", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "endDate", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "limit", in: "query", schema: { type: "integer", default: 100, maximum: 1000 } },
        ],
        responses: {
          200: { description: "Telemetry data" },
        },
      },
      post: {
        summary: "Submit telemetry",
        description: "Submit new telemetry readings for a device",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["deviceId", "readings"],
                properties: {
                  deviceId: { type: "string" },
                  readings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        variable: { type: "string" },
                        value: { type: "number" },
                        timestamp: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Telemetry created" },
        },
      },
    },
    "/alerts": {
      get: {
        summary: "List alerts",
        description: "Get alerts for the authenticated tenant",
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["open", "acknowledged", "resolved", "closed"] } },
          { name: "severity", in: "query", schema: { type: "string", enum: ["info", "warning", "critical"] } },
          { name: "deviceId", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "List of alerts" },
        },
      },
      patch: {
        summary: "Update alert status",
        description: "Acknowledge or resolve an alert",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["alertId", "status"],
                properties: {
                  alertId: { type: "string" },
                  status: { type: "string", enum: ["acknowledged", "resolved", "closed"] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Alert updated" },
        },
      },
    },
    "/reports": {
      get: {
        summary: "Generate report",
        description: "Generate analytics reports",
        parameters: [
          { name: "type", in: "query", schema: { type: "string", enum: ["summary", "telemetry"] } },
          { name: "startDate", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "endDate", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "deviceId", in: "query", schema: { type: "string", description: "Required for telemetry report" } },
        ],
        responses: {
          200: { description: "Report data" },
        },
      },
    },
    "/webhooks": {
      get: {
        summary: "List webhooks",
        description: "Get configured webhooks",
        responses: {
          200: { description: "List of webhooks and available events" },
        },
      },
      post: {
        summary: "Create webhook",
        description: "Register a new webhook endpoint",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["url", "events"],
                properties: {
                  url: { type: "string", format: "uri" },
                  events: { type: "array", items: { type: "string" } },
                  secret: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Webhook created" },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(apiDocs);
}
