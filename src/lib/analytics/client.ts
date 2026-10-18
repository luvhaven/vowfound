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

  // Carry campaign attribution through this tab's funnel without retaining
  // assessment answers or arbitrary URL query parameters.
  let campaign: Record<string, string> = {};
  try {
    const key = "vf.analytics.campaign";
    const stored = JSON.parse(window.sessionStorage.getItem(key) || "{}");
    const query = new URLSearchParams(window.location.search);
    for (const field of ["utm_source", "utm_medium", "utm_campaign"]) {
      const value = query.get(field) || stored[field];
      if (typeof value === "string") campaign[field] = value.slice(0, 160);
    }
    window.sessionStorage.setItem(key, JSON.stringify(campaign));
  } catch { campaign = {}; }
  const eventProperties = { ...campaign, ...Object.fromEntries(Object.entries(properties).filter(([, value]) => value != null)) };

  const payload = JSON.stringify({
    sessionId: sessionId(),
    eventName,
    path: window.location.pathname.slice(0, 300),
    referrer: document.referrer,
    properties: eventProperties,
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
  gtag?.("event", eventName, eventProperties);
}
