"use client";

import type { TrackEvent } from "@/lib/track-events";

const SESSION_KEY = "vf.sid";
const UTM_KEY = "vf.utm";

function sessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function utm() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(UTM_KEY) || "{}") as Record<string, string>;
    const q = new URLSearchParams(location.search);
    for (const k of ["utm_source", "utm_medium", "utm_campaign"]) {
      const v = q.get(k);
      if (v) stored[k] = v.slice(0, 160);
    }
    sessionStorage.setItem(UTM_KEY, JSON.stringify(stored));
    return stored;
  } catch {
    return {};
  }
}

function referrerHost() {
  try {
    const host = document.referrer ? new URL(document.referrer).host : null;
    return host && host !== location.host ? host : null;
  } catch {
    return null;
  }
}

/** Fire-and-forget. Never throws, never blocks navigation. */
export function track(event: TrackEvent, props: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({ sessionId: sessionId(), event, path: location.pathname, referrerHost: referrerHost(), utm: utm(), props });
  try {
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
    }
  } catch {}
}
