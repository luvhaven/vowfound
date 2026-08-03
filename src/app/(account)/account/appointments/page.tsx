import Link from "next/link";
import { Paper } from "@/components/ui/paper";
import { Button } from "@/components/ui/button";
import { WorkspaceHeader } from "@/components/ui/workspace-header";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/admin";

interface Row {
  id: string;
  kind: string;
  status: string;
  scheduled_for: string | null;
  join_url: string | null;
}

async function appointments(): Promise<Row[]> {
  if (!supabaseConfigured()) return [];
  const user = await getSessionUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select("id, kind, status, scheduled_for, join_url")
    .eq("user_id", user.id)
    .order("scheduled_for", { ascending: true });

  return (data ?? []) as Row[];
}

export default async function AppointmentsPage() {
  const rows = await appointments();

  return (
    <div className="max-w-4xl">
      <WorkspaceHeader
        eyebrow="Your calendar"
        title="Appointments"
        body="Every conversation has a purpose and a clear next step. Your joining details appear here as soon as a time is confirmed."
        detail={rows.length === 1 ? "1 appointment" : `${rows.length} appointments`}
      />
      <div className="mt-8">
        <Paper className="p-7 md:p-9">
          {rows.length === 0 ? (
            <div className="grid gap-8 md:grid-cols-[5rem_1fr] md:items-start">
              <p className="numeral display text-[3.5rem] leading-none text-stone" aria-hidden>
                00
              </p>
              <div>
                <p className="engraved text-oxblood">Your calendar is clear</p>
              <p className="text-[16px] leading-relaxed text-slate">
                Nothing booked. Your coach will have read your readiness map
                before the call, so it starts somewhere useful.
              </p>
              <div className="mt-7">
                <Button asChild variant="onpaper">
                  <Link href="/book">Book a consultation</Link>
                </Button>
              </div>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-stone">
              {rows.map((row) => (
                <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="engraved text-ink">{row.kind}</p>
                    <p className="mt-1 text-[14px] text-slate">
                      {row.scheduled_for
                        ? new Date(row.scheduled_for).toLocaleString()
                        : "Time to be confirmed"}
                    </p>
                  </div>
                  {row.join_url ? (
                    <a href={row.join_url} className="engraved text-ink underline decoration-stone underline-offset-4">
                      Join
                    </a>
                  ) : (
                    <p className="engraved text-slate">{row.status}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Paper>
      </div>
    </div>
  );
}
