"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SoundSettingsState } from "@/types/dashboard";

const DEFAULT_SETTINGS: SoundSettingsState = {
  enabled: false,
  volume: 0.5,
  warningSound: "/sounds/warn.mp3",
  criticalSound: "/sounds/critical.mp3",
};

const STORAGE_KEY = "mechatronics_sound_settings";

export function useSoundNotifications() {
  const [settings, setSettings] = useState<SoundSettingsState>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastPlayedRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        } catch {
          // Invalid JSON, use defaults
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage when changed
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const updateSettings = useCallback((updates: Partial<SoundSettingsState>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleEnabled = useCallback(() => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const playSound = useCallback((type: "warn" | "critical") => {
    if (!settings.enabled || typeof window === "undefined") return;

    const soundUrl = type === "critical" ? settings.criticalSound : settings.warningSound;

    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(soundUrl);
      audioRef.current.volume = settings.volume;
      audioRef.current.play().catch(() => {
        // Audio play failed (likely user hasn't interacted with page)
      });
    } catch {
      // Audio not supported
    }
  }, [settings]);

  const playAlertSound = useCallback((alertId: string, severity: "warn" | "critical" | "info") => {
    // Only play for warn/critical, and only if not already played
    if (severity === "info") return;
    if (lastPlayedRef.current.has(alertId)) return;

    lastPlayedRef.current.add(alertId);
    playSound(severity);

    // Clean up old entries after 5 minutes
    setTimeout(() => {
      lastPlayedRef.current.delete(alertId);
    }, 5 * 60 * 1000);
  }, [playSound]);

  return {
    settings,
    updateSettings,
    toggleEnabled,
    playSound,
    playAlertSound,
    isLoaded,
  };
}
