"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";
import { getViewer, recordAudit } from "@/lib/admin.server";
import { defaultFor, isEditableKey } from "@/lib/content/registry";
import { CONTENT_TAG } from "@/lib/content/read.server";

/**
 * A CMS is the obvious hole in "never guarantee a marriage": the rule is
 * enforced in code and tested in the repo, and then somebody types a promise
 * into an admin form and it goes live.
 *
 * So the same rule is enforced on the way in. These are checked against the
 * submitted value, and a match is refused with the reason shown.
 */
const FORBIDDEN: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /guarantee[sd]?\s+(you\s+)?(a\s+)?(marriage|engagement|husband|wife|spouse)/i,
    reason: "This promises a marriage. We guarantee the work, never the outcome.",
  },
  {
    pattern: /you\s+will\s+(be\s+)?(married|engaged)/i,
    reason: "This promises an outcome no one can promise.",
  },
  {
    pattern: /guaranteed\s+(marriage|match|husband|wife)/i,
    reason: "This promises a marriage. We guarantee the work, never the outcome.",
  },
  {
    pattern: /\b\d{1,3}\s?%\s*(success|of (our )?(clients|members)|married|match)/i,
    reason:
      "This is a success rate. We do not publish one until we can show the method behind it.",
  },
  {
    pattern: /\b(join|over)\s+[\d,]+\+?\s+(members|clients|couples|singles)/i,
    reason: "This is a member count we cannot evidence.",
  },
  {
    pattern: /\b(only|just)\s+\d+\s+(places?|spots?|slots?)\s+(left|remaining)/i,
    reason: "This is manufactured scarcity.",
  },
  {
    pattern: /\bsoulmate|your person is out there|level up|game.?changer\b/i,
    reason: "This is on the banned-words list for the brand voice.",
  },
];

/** Negations are fine: "we do not guarantee a marriage" must stay sayable. */
const NEGATED = /\b(not|never|no\s?one|nobody|cannot|can't|beware|careful of|do not)\b/i;

function violation(value: string): string | null {
  for (const rule of FORBIDDEN) {
    const match = rule.pattern.exec(value);
    if (!match) continue;
    const preceding = value.slice(Math.max(0, match.index - 70), match.index);
    if (!NEGATED.test(preceding)) return rule.reason;
  }
  return null;
}

const schema = z.object({
  key: z.string().min(1).max(120),
  value: z.string().max(4000),
});

export async function saveContent(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  const { key, value } = parsed.data;

  // Only keys the code actually asks for. A forged key cannot create a row.
  if (!isEditableKey(key)) {
    return { ok: false as const, error: "That field is not editable." };
  }

  const viewer = await getViewer();
  const allowed =
    viewer?.isAdmin || viewer?.roles.includes("content_editor");
  if (!viewer || !allowed) {
    return { ok: false as const, error: "You cannot edit content." };
  }
  if (!supabaseConfigured()) {
    return { ok: false as const, error: "Database is not connected." };
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return {
      ok: false as const,
      error: "Empty is not a value. Use revert to restore the original.",
    };
  }

  const problem = violation(trimmed);
  if (problem) return { ok: false as const, error: problem };

  const db = createAdminClient();
  const { error } = await db.from("site_content").upsert(
    {
      key,
      value: trimmed,
      default_value: defaultFor(key),
      updated_by: viewer.id,
    },
    { onConflict: "key" },
  );

  if (error) return { ok: false as const, error: error.message };

  await recordAudit({
    actorId: viewer.id,
    action: "content.updated",
    subjectTable: "site_content",
    subjectId: key,
  });

  // updateTag rather than revalidateTag: this runs in a server action, and
  // read-your-own-writes means the editor sees the change on the very next
  // render instead of waiting for a revalidation pass.
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
  return { ok: true as const };
}

/** Restores the value that ships in the code. */
export async function revertContent(input: unknown) {
  const parsed = z.object({ key: z.string().min(1).max(120) }).safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };
  if (!isEditableKey(parsed.data.key)) {
    return { ok: false as const, error: "That field is not editable." };
  }

  const viewer = await getViewer();
  const allowed = viewer?.isAdmin || viewer?.roles.includes("content_editor");
  if (!viewer || !allowed) {
    return { ok: false as const, error: "You cannot edit content." };
  }
  if (!supabaseConfigured()) {
    return { ok: false as const, error: "Database is not connected." };
  }

  const db = createAdminClient();
  await db.from("site_content").delete().eq("key", parsed.data.key);

  await recordAudit({
    actorId: viewer.id,
    action: "content.reverted",
    subjectTable: "site_content",
    subjectId: parsed.data.key,
  });

  // updateTag rather than revalidateTag: this runs in a server action, and
  // read-your-own-writes means the editor sees the change on the very next
  // render instead of waiting for a revalidation pass.
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
  return { ok: true as const };
}
