import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

const primitive = z.union([z.string().max(160), z.number(), z.boolean(), z.null()]);
const schema = z.object({
  sessionId: z.string().uuid(),
  eventName: z.enum(ANALYTICS_EVENTS),
  path: z.string().startsWith("/").max(300),
  referrer: z.string().url().max(1000).optional().or(z.literal("")),
  properties: z.record(z.string().max(40), primitive.optional()).optional(),
});

const BLOCKED_PROPERTY = /email|name|phone|message|answer|password|token/i;

function cleanProperties(input: Record<string, unknown> | undefined) {
  return Object.fromEntries(
    Object.entries(input ?? {})
      .filter(([key, value]) => !BLOCKED_PROPERTY.test(key) && value !== undefined)
      .slice(0, 20),
  );
}

export async function POST(request: Request) {
  if (!supabaseConfigured()) return new NextResponse(null, { status: 204 });

  const h = await headers();
  const userAgent = h.get("user-agent") ?? "";
  if (/bot|crawler|spider|preview/i.test(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }

  const allowed = await rateLimit(
    `analytics:${h.get("x-forwarded-for") ?? "local"}`,
    240,
    3600,
  );
  if (!allowed) return new NextResponse(null, { status: 204 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return new NextResponse(null, { status: 204 });

  let referrerHost: string | null = null;
  if (parsed.data.referrer) {
    try {
      referrerHost = new URL(parsed.data.referrer).hostname.slice(0, 160);
    } catch {
      referrerHost = null;
    }
  }

  const properties = cleanProperties(parsed.data.properties);
  const db = createAdminClient();
  await db.from("analytics_events").insert({
    session_id: parsed.data.sessionId,
    event_name: parsed.data.eventName,
    path: parsed.data.path,
    referrer_host: referrerHost,
    utm_source:
      typeof properties.utm_source === "string" ? properties.utm_source : null,
    utm_medium:
      typeof properties.utm_medium === "string" ? properties.utm_medium : null,
    utm_campaign:
      typeof properties.utm_campaign === "string" ? properties.utm_campaign : null,
    properties,
  });

  return new NextResponse(null, {
    status: 204,
    headers: { "cache-control": "no-store" },
  });
}
