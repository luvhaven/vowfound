"use server";

import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { scoreAssessment, type ReadinessMap } from "@/lib/assessment/scoring";
import { QUESTIONS } from "@/lib/assessment/questions";

const ANON_COOKIE = "vf_assessment";

const answerValue = z.union([
  z.string().max(8000),
  z.number(),
  z.boolean(),
  z.array(z.string().max(200)).max(20),
]);

const progressSchema = z.object({
  step: z.number().int().min(0).max(200),
  answers: z.record(z.string().max(80), answerValue),
});

const KNOWN_KEYS = new Set(QUESTIONS.map((q) => q.key));

async function anonKey(): Promise<string> {
  const store = await cookies();
  const existing = store.get(ANON_COOKIE)?.value;
  if (existing) return existing;

  const key = randomUUID();
  store.set(ANON_COOKIE, key, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return key;
}

/** Drop anything not in the question set before it reaches the database. */
function cleanAnswers(answers: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(answers).filter(([key]) => KNOWN_KEYS.has(key)),
  );
}

/**
 * Called on every step, so a partial completion is always recoverable and a
 * returning user continues where they left off.
 */
export async function saveProgress(input: unknown) {
  const parsed = progressSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "invalid" };
  }

  const answers = cleanAnswers(parsed.data.answers);
  const key = await anonKey();

  if (!supabaseConfigured()) {
    // Local development without Supabase: the client keeps its own copy and
    // the run completes normally. Nothing is silently lost.
    return { ok: true as const, persisted: false };
  }

  const db = createAdminClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assessment, error } = await db
    .from("assessments")
    .upsert(
      {
        anon_key: key,
        user_id: user?.id ?? null,
        current_step: parsed.data.step,
        marriage_timeline:
          typeof answers.timeline === "string" ? answers.timeline : null,
        contact_email:
          typeof answers.contact_email === "string"
            ? answers.contact_email
            : null,
        contact_name:
          typeof answers.contact_name === "string" ? answers.contact_name : null,
      },
      { onConflict: "anon_key" },
    )
    .select("id")
    .single();

  if (error || !assessment) {
    return { ok: false as const, error: "save_failed" };
  }

  const rows = Object.entries(answers).map(([question_key, value]) => ({
    assessment_id: assessment.id,
    question_key,
    value: value as never,
  }));

  if (rows.length > 0) {
    await db
      .from("assessment_answers")
      .upsert(rows, { onConflict: "assessment_id,question_key" });
  }

  return { ok: true as const, persisted: true };
}

/**
 * Scores server-side. The client never computes its own result, so a readiness
 * map cannot be forged by editing local state.
 */
export async function completeAssessment(input: unknown): Promise<
  | { ok: true; map: ReadinessMap }
  | { ok: false; error: string }
> {
  const parsed = progressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const answers = cleanAnswers(parsed.data.answers);
  const map = scoreAssessment(answers);
  const key = await anonKey();

  if (!supabaseConfigured()) {
    return { ok: true, map };
  }

  const db = createAdminClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assessment } = await db
    .from("assessments")
    .upsert(
      {
        anon_key: key,
        user_id: user?.id ?? null,
        status: "completed",
        completed_at: new Date().toISOString(),
        current_step: parsed.data.step,
        marriage_timeline:
          typeof answers.timeline === "string" ? answers.timeline : null,
        contact_email:
          typeof answers.contact_email === "string"
            ? answers.contact_email
            : null,
        contact_name:
          typeof answers.contact_name === "string" ? answers.contact_name : null,
      },
      { onConflict: "anon_key" },
    )
    .select("id")
    .single();

  if (assessment) {
    const rows = Object.entries(answers).map(([question_key, value]) => ({
      assessment_id: assessment.id,
      question_key,
      value: value as never,
    }));
    if (rows.length > 0) {
      await db
        .from("assessment_answers")
        .upsert(rows, { onConflict: "assessment_id,question_key" });
    }

    await db.from("readiness_results").upsert(
      {
        assessment_id: assessment.id,
        user_id: user?.id ?? null,
        bands: map.dimensions.reduce<Record<string, unknown>>((acc, d) => {
          acc[d.key] = {
            band: d.band,
            note: d.note,
            first_action: d.firstAction,
          };
          return acc;
        }, {}),
        strengths: map.strengths,
        obstacles: map.obstacles,
        recommended_product: map.recommendedProduct,
        summary: map.summary,
        engine_version: map.engineVersion,
      },
      { onConflict: "assessment_id" },
    );

    if (typeof answers.contact_email === "string") {
      await db.from("leads").insert({
        email: answers.contact_email,
        full_name:
          typeof answers.contact_name === "string" ? answers.contact_name : null,
        marriage_timeline:
          typeof answers.timeline === "string" ? answers.timeline : null,
        source: "assessment",
        assessment_id: assessment.id,
        converted_user_id: user?.id ?? null,
      });
    }
  }

  return { ok: true, map };
}
