"use client";

import * as React from "react";
import { track } from "@/lib/track";
import type { TrackEvent } from "@/lib/track-events";

/** Fires one event when a server-rendered page mounts. */
export function TrackOnMount({ event, props }: { event: TrackEvent; props?: Record<string, string> }) {
  const sent = React.useRef(false);
  React.useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track(event, props);
  }, [event, props]);
  return null;
}
