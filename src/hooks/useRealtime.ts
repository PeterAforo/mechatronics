"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createRealtimeConnection, RealtimeEvent, RealtimeEventType } from "@/lib/realtime";

interface UseRealtimeOptions {
  tenantId: string;
  onTelemetry?: (data: unknown, deviceId?: string) => void;
  onAlert?: (data: unknown) => void;
  onDeviceStatus?: (data: unknown, deviceId?: string) => void;
  onOtaStatus?: (data: unknown, deviceId?: string) => void;
  enabled?: boolean;
}

export function useRealtime({
  tenantId,
  onTelemetry,
  onAlert,
  onDeviceStatus,
  onOtaStatus,
  enabled = true,
}: UseRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const connectionRef = useRef<{ close: () => void } | null>(null);

  const handleMessage = useCallback(
    (event: RealtimeEvent) => {
      switch (event.type) {
        case "telemetry":
          onTelemetry?.(event.data, event.deviceId);
          break;
        case "alert":
          onAlert?.(event.data);
          break;
        case "device_status":
          onDeviceStatus?.(event.data, event.deviceId);
          break;
        case "ota_status":
          onOtaStatus?.(event.data, event.deviceId);
          break;
      }
    },
    [onTelemetry, onAlert, onDeviceStatus, onOtaStatus]
  );

  useEffect(() => {
    if (!enabled || !tenantId) return;

    connectionRef.current = createRealtimeConnection(
      tenantId,
      (event) => {
        if (event.type === "connected" as RealtimeEventType) {
          setIsConnected(true);
          setError(null);
        } else {
          handleMessage(event);
        }
      },
      (err) => {
        setIsConnected(false);
        setError(err);
      }
    );

    return () => {
      connectionRef.current?.close();
      setIsConnected(false);
    };
  }, [tenantId, enabled, handleMessage]);

  return { isConnected, error };
}
