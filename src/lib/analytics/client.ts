"use client";

import type {
  AnalyticsEventName,
  AnalyticsProperties,
} from "@/lib/analytics/events";

const SESSION_KEY = "vf.analytics.session";

function sessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = window.crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return window.crypto.randomUUID();
  }
}

export function trackEvent(
  eventName: AnalyticsEventName,
  properties: AnalyticsProperties = {},
) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    sessionId: sessionId(),
    eventName,
    path: `${window.location.pathname}${window.location.search}`.slice(0, 300),
    referrer: document.referrer,
    properties,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/analytics",
      new Blob([payload], { type: "application/json" }),
    );
  } else {
    void fetch("/api/analytics", {
      method: "POST",
      body: payload,
      headers: { "content-type": "application/json" },
      keepalive: true,
    });
  }

  const gtag = (
    window as typeof window & {
      gtag?: (command: "event", name: string, values?: Record<string, unknown>) => void;
    }
  ).gtag;
  gtag?.("event", eventName, properties);
}
