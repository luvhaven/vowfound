import "server-only";
import { Resend } from "resend";
import { BRAND, SITE_URL } from "@/lib/brand";

interface EmailInput {
  to: string;
  subject: string;
  heading: string;
  /** Paragraphs. Kept as plain strings so no template can smuggle a claim in. */
  body: string[];
  cta?: { label: string; href: string };
  replyTo?: string;
}

/**
 * Every transactional email is rendered through this one function. Nothing in
 * the templates promises an outcome, and the footer line is fixed here rather
 * than being editable content.
 */
export async function sendEmail(input: EmailInput) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? `${BRAND} <hello@vowfound.com>`;

  const html = render(input);

  if (!key) {
    // Development without a key: log rather than fail the request silently.
    console.info(`[email] would send "${input.subject}" to ${input.to}`);
    return { ok: false as const, reason: "not_configured" };
  }

  try {
    const resend = new Resend(key);
    await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html,
      replyTo: input.replyTo,
    });
    return { ok: true as const };
  } catch (error) {
    console.error("[email] send failed", error);
    return { ok: false as const, reason: "send_failed" };
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render({ heading, body, cta }: EmailInput) {
  const paragraphs = body
    .map(
      (p) =>
        `<p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#3a3742;">${escapeHtml(
          p,
        )}</p>`,
    )
    .join("");

  const button = cta
    ? `<a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#4A202C;color:#EFEAE1;text-decoration:none;padding:14px 28px;border-radius:3px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;font-family:Georgia,serif;">${escapeHtml(
        cta.label,
      )}</a>`
    : "";

  return `<!doctype html><html><body style="margin:0;background:#14121B;padding:40px 16px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#EFEAE1;border-radius:4px;" cellpadding="0" cellspacing="0"><tr><td style="padding:40px 36px;">
<p style="margin:0 0 28px;font-family:Georgia,serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#6C6A78;">${BRAND}</p>
<h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:28px;line-height:1.1;color:#14121B;font-weight:400;">${escapeHtml(
    heading,
  )}</h1>
${paragraphs}
${button}
<hr style="border:0;border-top:1px solid #D8D0C5;margin:32px 0 20px;" />
<p style="margin:0;font-size:13px;line-height:1.6;color:#6C6A78;">
We guarantee the work, not the outcome. Nobody can promise you a marriage, including us.
</p>
<p style="margin:14px 0 0;font-size:13px;color:#6C6A78;">
<a href="${SITE_URL}/privacy" style="color:#6C6A78;">Privacy</a> &middot;
<a href="${SITE_URL}/account/privacy" style="color:#6C6A78;">Export or delete your data</a>
</p>
</td></tr></table>
</td></tr></table></body></html>`;
}
