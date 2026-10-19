"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, staffInbox } from "@/lib/email";

export type FormState = { ok?: boolean; error?: string } | undefined;

async function allowed(kind: string) {
  const ip = (await headers()).get("x-forwarded-for") ?? "local";
  return rateLimit(`${kind}:${ip}`, 5, 3600);
}

const applySchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  city: z.string().trim().max(120).optional(),
  timeline: z.string().trim().max(120).optional(),
  about: z.string().trim().min(20, "Tell us a little more — a few sentences is plenty.").max(4000),
  website: z.string().max(0).optional(), // honeypot
});

export async function applyPrivate(_: FormState, form: FormData): Promise<FormState> {
  const parsed = applySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  if (!(await allowed("apply"))) return { error: "Too many submissions. Try again later." };
  if (!adminConfigured()) return { error: "Applications are being set up. Email hello@vowfound.com." };

  const row = { ...parsed.data };
  delete row.website;
  const { error } = await createAdminClient().from("applications").insert(row);
  if (error) {
    console.error("[apply] insert failed", error);
    return { error: "We couldn't send that. Please try again." };
  }
  await sendEmail(row.email, "We've got your application", "Thank you for applying to VowFound Private. A principal reads every application personally and will reply within a week.\n\n— VowFound");
  await sendEmail(staffInbox(), "New Private application", `${row.full_name} <${row.email}> — ${row.city ?? ""}\n\n${row.about}`);
  return { ok: true };
}

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(5).max(4000),
  website: z.string().max(0).optional(),
});

export async function sendEnquiry(_: FormState, form: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Please add your name, email and a message." };
  if (!(await allowed("contact"))) return { error: "Too many messages. Try again later." };
  if (!adminConfigured()) return { error: "Email hello@vowfound.com directly for now." };

  const row = { ...parsed.data };
  delete row.website;
  const { error } = await createAdminClient().from("enquiries").insert(row);
  if (error) {
    console.error("[contact] insert failed", error);
    return { error: "We couldn't send that. Please try again." };
  }
  await sendEmail(staffInbox(), `Enquiry from ${row.name}`, `${row.email}\n\n${row.message}`);
  return { ok: true };
}
