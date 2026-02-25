/**
 * Real-time updates using Server-Sent Events (SSE)
 * Works with serverless deployments like Vercel
 */

export type RealtimeEventType = 
  | "telemetry"
  | "alert"
  | "device_status"
  | "ota_status";

export interface RealtimeEvent {
  type: RealtimeEventType;
  data: unknown;
  timestamp: string;
  tenantId?: string;
  deviceId?: string;
}

// Client-side connection for SSE
export function createRealtimeConnection(
  tenantId: string,
  onMessage: (event: RealtimeEvent) => void,
  onError?: (error: Error) => void
): { close: () => void } {
  let eventSource: EventSource | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let reconnectAttempts = 0;

  const connect = () => {
    if (typeof window === "undefined") return;

    try {
      eventSource = new EventSource(`/api/realtime?tenantId=${tenantId}`);

      eventSource.onopen = () => {
        reconnectAttempts = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as RealtimeEvent;
          onMessage(data);
        } catch (e) {
          console.error("Failed to parse realtime event:", e);
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        if (reconnectAttempts < 5) {
          const delay = 1000 * Math.pow(2, reconnectAttempts);
          reconnectAttempts++;
          reconnectTimeout = setTimeout(connect, delay);
        } else {
          onError?.(new Error("Max reconnection attempts reached"));
        }
      };
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error("Connection failed"));
    }
  };

  connect();

  return {
    close: () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      eventSource?.close();
    },
  };
}

// Server-side event emitter
class RealtimeEventEmitter {
  private listeners: Map<string, Set<(event: RealtimeEvent) => void>> = new Map();

  subscribe(tenantId: string, callback: (event: RealtimeEvent) => void): () => void {
    if (!this.listeners.has(tenantId)) {
      this.listeners.set(tenantId, new Set());
    }
    this.listeners.get(tenantId)!.add(callback);

    return () => {
      this.listeners.get(tenantId)?.delete(callback);
      if (this.listeners.get(tenantId)?.size === 0) {
        this.listeners.delete(tenantId);
      }
    };
  }

  emit(tenantId: string, event: RealtimeEvent): void {
    this.listeners.get(tenantId)?.forEach((cb) => cb(event));
  }

  broadcast(event: RealtimeEvent): void {
    this.listeners.forEach((callbacks) => callbacks.forEach((cb) => cb(event)));
  }
}

export const realtimeEmitter = new RealtimeEventEmitter();

export function emitTelemetryUpdate(
  tenantId: string,
  deviceId: string,
  data: Record<string, number | string>
): void {
  realtimeEmitter.emit(tenantId, {
    type: "telemetry",
    data,
    deviceId,
    tenantId,
    timestamp: new Date().toISOString(),
  });
}

export function emitAlertEvent(
  tenantId: string,
  alert: { id: string; title: string; severity: string }
): void {
  realtimeEmitter.emit(tenantId, {
    type: "alert",
    data: alert,
    tenantId,
    timestamp: new Date().toISOString(),
  });
}
