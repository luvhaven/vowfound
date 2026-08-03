import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceHeader } from "@/components/ui/workspace-header";
import {
  Panel,
  DefinitionList,
  StatusPill,
  EmptyState,
  formatDateTime,
} from "@/components/admin/primitives";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/admin";
import { getViewer, recordAudit } from "@/lib/admin.server";
import { QUESTIONS } from "@/lib/assessment/questions";
import { BAND_LABEL, DIMENSIONS, type Band } from "@/lib/assessment/dimensions";

interface Assessment {
  id: string;
  user_id: string | null;
  status: string;
  current_step: number;
  marriage_timeline: string | null;
  timeline_deferred: boolean;
  contact_email: string | null;
  contact_name: string | null;
  created_at: string;
  completed_at: string | null;
}

interface Answer {
  question_key: string;
  value: unknown;
  answered_at: string;
}

/** Renders a stored answer as the label the person actually saw. */
function present(key: string, value: unknown): string {
  const question = QUESTIONS.find((q) => q.key === key);
  if (!question) return String(value);

  if (Array.isArray(value)) {
    return value
      .map(
        (v) => question.choices?.find((c) => c.value === v)?.label ?? String(v),
      )
      .join(", ");
  }

  if (question.type === "single") {
    return (
      question.choices?.find((c) => c.value === value)?.label ?? String(value)
    );
  }

  if (question.type === "scale" && question.scale) {
    return `${value} of ${question.scale.max}`;
  }

  return String(value);
}

export default async function AdminAssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!supabaseConfigured()) notFound();

  const supabase = await createClient();
  const viewer = await getViewer();

  const { data: assessment } = await supabase
    .from("assessments")
    .select(
      "id, user_id, status, current_step, marriage_timeline, timeline_deferred, contact_email, contact_name, created_at, completed_at",
    )
    .eq("id", id)
    .maybeSingle<Assessment>();

  if (!assessment) notFound();

  if (viewer) {
    await recordAudit({
      actorId: viewer.id,
      action: "admin.assessment.view",
      subjectTable: "assessments",
      subjectId: id,
      subjectUserId: assessment.user_id ?? undefined,
    });
  }

  const [{ data: answers }, { data: result }] = await Promise.all([
    supabase
      .from("assessment_answers")
      .select("question_key, value, answered_at")
      .eq("assessment_id", id),
    supabase
      .from("readiness_results")
      .select("bands, strengths, obstacles, recommended_product, summary")
      .eq("assessment_id", id)
      .maybeSingle(),
  ]);

  const byKey = new Map<string, Answer>(
    (answers ?? []).map((a) => [a.question_key, a as Answer]),
  );

  const honest = byKey.get("honest_reason");
  const bands = (result?.bands ?? {}) as Record<
    string,
    { band: Band; note: string; first_action: string | null }
  >;

  // Grouped in the order the person answered them.
  const sections = [...new Set(QUESTIONS.map((q) => q.section))];

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Readiness intake"
        title={assessment.contact_name ?? assessment.contact_email ?? "Anonymous run"}
        body="Every answer is stored word for word and shown here unedited. Opening this record is written to the audit log."
        detail={`Step ${assessment.current_step}`}
      />

      <p className="mt-6">
        <Link
          href="/admin/assessments"
          className="engraved text-onink-faint underline decoration-onink-faint/40 underline-offset-4 hover:text-onink"
        >
          Back to assessments
        </Link>
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="grid gap-6">
          {honest && (
            <Panel
              title="The honest reason"
              description="The single most useful thing anyone tells us, and where the coaching starts."
            >
              <blockquote className="border-l-2 border-rose/50 pl-5">
                <p className="display text-[1.3rem] leading-snug text-onink">
                  &ldquo;{String(honest.value)}&rdquo;
                </p>
              </blockquote>
            </Panel>
          )}

          {sections.map((section) => {
            const questions = QUESTIONS.filter(
              (q) => q.section === section && byKey.has(q.key),
            );
            if (questions.length === 0) return null;

            return (
              <Panel key={section} title={section}>
                <DefinitionList
                  items={questions.map((q) => ({
                    label: q.prompt,
                    value:
                      q.type === "longtext" ? (
                        <span className="whitespace-pre-wrap">
                          {String(byKey.get(q.key)!.value)}
                        </span>
                      ) : (
                        present(q.key, byKey.get(q.key)!.value)
                      ),
                  }))}
                />
              </Panel>
            );
          })}

          {byKey.size === 0 && (
            <EmptyState
              title="No answers"
              body="This run was started but no question was answered before it stopped."
            />
          )}
        </div>

        <div className="grid gap-6">
          <Panel title="Run">
            <DefinitionList
              items={[
                { label: "Status", value: <StatusPill value={assessment.status} /> },
                { label: "Started", value: formatDateTime(assessment.created_at) },
                { label: "Completed", value: formatDateTime(assessment.completed_at) },
                {
                  label: "Timeline",
                  value: assessment.timeline_deferred
                    ? "Deferred by the person"
                    : (assessment.marriage_timeline ?? "Not stated"),
                },
                { label: "Email", value: assessment.contact_email ?? "Not given" },
                {
                  label: "Account",
                  value: assessment.user_id ? (
                    <Link
                      href={`/admin/users/${assessment.user_id}`}
                      className="underline decoration-onink-faint/40 underline-offset-4 hover:text-onink"
                    >
                      Open member record
                    </Link>
                  ) : (
                    "Anonymous"
                  ),
                },
              ]}
            />
          </Panel>

          {result && (
            <Panel
              title="Readiness map"
              description="Produced by the scoring engine server-side. No aggregate score is stored, by design."
            >
              <p className="text-[14px] leading-relaxed text-onink-dim">
                {result.summary}
              </p>
              <ul className="mt-6 divide-y divide-hairline">
                {DIMENSIONS.filter((d) => bands[d.key]).map((d) => (
                  <li
                    key={d.key}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="text-[14px] text-onink-dim">{d.name}</span>
                    <span className="engraved shrink-0 text-onink-faint">
                      {BAND_LABEL[bands[d.key].band]}
                    </span>
                  </li>
                ))}
              </ul>
              {result.recommended_product && (
                <p className="mt-6 border-t border-hairline pt-5 text-[14px] text-onink-dim">
                  Recommended:{" "}
                  <span className="text-onink">{result.recommended_product}</span>
                </p>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
