import { EmptyState, Metric, Panel } from "@/components/admin/primitives";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";

type EventRow = {
  session_id: string;
  event_name: string;
  path: string;
  referrer_host: string | null;
  utm_source: string | null;
  properties: Record<string, unknown> | null;
  created_at: string;
};

type Ranked = { label: string; value: number };

function rank(values: Array<string | null | undefined>, limit = 6): Ranked[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function uniqueSessions(rows: EventRow[], event: string) {
  return new Set(
    rows.filter((row) => row.event_name === event).map((row) => row.session_id),
  ).size;
}

function percentile(values: number[], point: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * point) - 1)];
}

function vital(rows: EventRow[], metric: string) {
  return percentile(
    rows
      .filter(
        (row) =>
          row.event_name === "web_vital" && row.properties?.metric === metric,
      )
      .map((row) => Number(row.properties?.value))
      .filter(Number.isFinite),
    0.75,
  );
}

function conversion(numerator: number, denominator: number) {
  if (!denominator) return "—";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function thirtyDaysAgo() {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
}

export default async function AnalyticsPage() {
  let rows: EventRow[] = [];
  let connected = false;

  if (supabaseConfigured()) {
    const since = thirtyDaysAgo();
    const db = createAdminClient();
    const result = await db
      .from("analytics_events")
      .select(
        "session_id,event_name,path,referrer_host,utm_source,properties,created_at",
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10_000);

    connected = !result.error;
    rows = (result.data ?? []) as EventRow[];
  }

  const visitors = uniqueSessions(rows, "page_view");
  const assessmentStarts = uniqueSessions(rows, "assessment_start");
  const assessmentCompletes = uniqueSessions(rows, "assessment_complete");
  const contactSuccesses = uniqueSessions(rows, "contact_success");
  const checkoutStarts = uniqueSessions(rows, "checkout_start");
  const intentSessions = new Set(
    rows
      .filter((row) =>
        ["assessment_start", "contact_success", "checkout_start"].includes(
          row.event_name,
        ),
      )
      .map((row) => row.session_id),
  ).size;

  const topPages = rank(
    rows.filter((row) => row.event_name === "page_view").map((row) => row.path),
  );
  const sources = rank(
    rows
      .filter((row) => row.event_name === "page_view")
      .map((row) => row.utm_source ?? row.referrer_host ?? "Direct / private"),
  );

  const lcp = vital(rows, "LCP");
  const inp = vital(rows, "INP");
  const cls = vital(rows, "CLS");

  return (
    <div>
      <p className="engraved text-rose">Growth intelligence</p>
      <h1 className="display-md mt-3 text-onink">Conversion & experience</h1>
      <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-onink-dim">
        The last 30 days of first-party, session-level behaviour. Contact details,
        assessment answers, and message contents are never stored here.
      </p>

      {!connected ? (
        <div className="mt-8">
          <EmptyState
            title="Analytics migration required"
            body="Apply migration 0008_analytics.sql to begin collecting privacy-conscious conversion and Web Vitals data."
          />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Visitors" value={visitors} hint="Unique browser sessions" />
            <Metric
              label="High-intent rate"
              value={conversion(intentSessions, visitors)}
              hint="Assessment, enquiry, or checkout"
            />
            <Metric
              label="Assessment completion"
              value={conversion(assessmentCompletes, assessmentStarts)}
              hint={`${assessmentCompletes} of ${assessmentStarts} starters`}
            />
            <Metric
              label="Direct enquiries"
              value={contactSuccesses}
              hint={`${checkoutStarts} checkout starts`}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Panel
              title="Intent funnel"
              description="Unique sessions at each meaningful decision point."
            >
              <RankedBars
                rows={[
                  { label: "Site visitors", value: visitors },
                  { label: "Assessment started", value: assessmentStarts },
                  { label: "Assessment completed", value: assessmentCompletes },
                  { label: "Enquiry sent", value: contactSuccesses },
                  { label: "Checkout started", value: checkoutStarts },
                ]}
              />
            </Panel>

            <Panel
              title="Real-user performance"
              description="75th-percentile field measurements from actual visits."
            >
              <dl className="grid grid-cols-3 gap-4">
                <Vital label="LCP" value={lcp} unit="ms" good={lcp !== null && lcp <= 2500} />
                <Vital label="INP" value={inp} unit="ms" good={inp !== null && inp <= 200} />
                <Vital label="CLS" value={cls} good={cls !== null && cls <= 0.1} />
              </dl>
            </Panel>

            <Panel title="Top pages" description="Where attention accumulates.">
              <RankedBars rows={topPages} />
            </Panel>

            <Panel title="Acquisition" description="UTM source first, referring host second.">
              <RankedBars rows={sources} />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function RankedBars({ rows }: { rows: Ranked[] }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  if (!rows.length) {
    return <p className="text-[14px] text-onink-faint">No measured visits yet.</p>;
  }
  return (
    <ol className="space-y-4">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex items-baseline justify-between gap-5">
            <span className="truncate text-[14px] text-onink-dim">{row.label}</span>
            <span className="numeral text-[13px] text-onink">{row.value}</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-onink/[0.06]">
            <div
              className="h-full rounded-full bg-rose/75"
              style={{ width: `${Math.max(3, (row.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Vital({
  label,
  value,
  unit,
  good,
}: {
  label: string;
  value: number | null;
  unit?: string;
  good: boolean;
}) {
  return (
    <div>
      <dt className="engraved text-onink-faint">{label}</dt>
      <dd className="numeral display mt-2 text-[1.55rem] text-onink">
        {value === null ? "—" : `${value}${unit ?? ""}`}
      </dd>
      <p className={`mt-1 text-[11px] ${value === null ? "text-onink-faint" : good ? "text-sage" : "text-rose"}`}>
        {value === null ? "Collecting" : good ? "Good" : "Needs attention"}
      </p>
    </div>
  );
}
