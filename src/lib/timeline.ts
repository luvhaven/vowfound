export const TIMELINE_OPTIONS = [
  { value: "3m", label: "Within 3 months", months: 3 },
  { value: "6m", label: "Within 6 months", months: 6 },
  { value: "9m", label: "Within 9 months", months: 9 },
  { value: "12m", label: "Within 12 months", months: 12 },
  { value: "undecided", label: "I need help deciding", months: null },
] as const;

export type TimelineValue = (typeof TIMELINE_OPTIONS)[number]["value"];

export const TIMELINE_VALUES = TIMELINE_OPTIONS.map((o) => o.value);

export function isTimelineValue(v: unknown): v is TimelineValue {
  return typeof v === "string" && (TIMELINE_VALUES as string[]).includes(v);
}

export function timelineLabel(v: TimelineValue): string {
  return TIMELINE_OPTIONS.find((o) => o.value === v)!.label;
}

/** Target date for a timeline, resolved from a given "today". */
export function targetDate(value: TimelineValue, from = new Date()): Date | null {
  const option = TIMELINE_OPTIONS.find((o) => o.value === value);
  if (!option?.months) return null;
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setMonth(d.getMonth() + option.months);
  return d;
}

export function daysUntil(target: Date, from = new Date()): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthYear(d: Date): { month: string; year: string } {
  return { month: MONTHS[d.getMonth()], year: String(d.getFullYear()) };
}

export const TIMELINE_COOKIE = "vf_timeline";
