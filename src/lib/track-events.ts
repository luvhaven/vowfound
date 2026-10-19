/** The funnel, in order. Anything not listed here is dropped by /api/track. */
export const TRACK_EVENTS = [
  "page_view",
  "cta_click",
  "check_start",
  "check_complete",
  "checkout_view",
  "checkout_submit",
  "purchase",
  "apply_submit",
  "contact_submit",
] as const;

export type TrackEvent = (typeof TRACK_EVENTS)[number];
