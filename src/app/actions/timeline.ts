"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { TIMELINE_COOKIE, TIMELINE_VALUES } from "@/lib/timeline";

const schema = z.object({
  timeline: z.enum(TIMELINE_VALUES as unknown as [string, ...string[]]),
});

/**
 * The hero choice persists into the assessment as the first answer and,
 * once contact details exist, onto the lead record. Stored in a cookie
 * rather than a row so that choosing a timeline is not itself an
 * identifying event.
 */
export async function recordTimelineIntent(value: string) {
  const parsed = schema.safeParse({ timeline: value });
  if (!parsed.success) return { ok: false as const };

  const store = await cookies();
  store.set(TIMELINE_COOKIE, parsed.data.timeline, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });

  return { ok: true as const };
}
