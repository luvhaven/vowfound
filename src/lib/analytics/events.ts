export const ANALYTICS_EVENTS = [
  "page_view",
  "section_view",
  "cta_click",
  "services_menu_open",
  "service_select",
  "timeline_select",
  "assessment_start",
  "assessment_complete",
  "contact_submit",
  "contact_success",
  "checkout_start",
  "application_submit",
  "sign_in",
  "sign_up",
  "web_vital",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;
