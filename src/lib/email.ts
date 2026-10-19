import "server-only";
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "VowFound <hello@vowfound.com>";

/** Sends if Resend is configured; otherwise logs and carries on. Email is never
 *  allowed to fail a payment or a sign-up. */
export async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.RESEND_API_KEY) {
    console.info(`[email skipped] ${subject} -> ${to}`);
    return;
  }
  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({ from: FROM, to, subject, text });
  } catch (error) {
    console.error("[email] send failed", error);
  }
}

export function staffInbox() {
  return process.env.STAFF_EMAIL ?? "hello@vowfound.com";
}
