"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { CONTACT_EMAIL } from "@/lib/brand";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(320),
  message: z.string().min(10).max(4000),
  service: z.string().trim().max(80).optional(),
  company: z.string().max(0).optional(),
});

export async function sendContactMessage(input: unknown) {
  const parsed = schema.safeParse(input);
  // A filled honeypot fails max(0) and lands here, indistinguishable from
  // any other invalid submission.
  if (!parsed.success) return { ok: false as const };

  const h = await headers();
  const allowed = await rateLimit(`contact:${h.get("x-forwarded-for") ?? "local"}`, 5, 3600);
  if (!allowed) return { ok: false as const };

  const { name, email, message, service } = parsed.data;

  let persisted = false;
  if (supabaseConfigured()) {
    const db = createAdminClient();
    const { error } = await db.from("leads").insert({
      email,
      full_name: name,
      source: `contact:${service || "general"}`,
    });
    persisted = !error;
    if (error) console.error("[contact] lead insert failed", error);
  }

  const delivery = await sendEmail({
    to: CONTACT_EMAIL,
    replyTo: email,
    subject: `Question from ${name}`,
    heading: "A question from the contact form",
    body: [
      `From: ${name} <${email}>`,
      `Interest: ${service || "Not sure yet"}`,
      message,
    ],
  });

  return delivery.ok || persisted
    ? { ok: true as const }
    : { ok: false as const };
}
