import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { TRACK_EVENTS } from "@/lib/track-events";

/**
 * First-party funnel events. No names, emails, answers or full URLs: just the
 * event, the path, the referring host and campaign tags, keyed to a session id
 * that lives in sessionStorage and dies with the tab.
 */
const schema = z.object({
  sessionId: z.string().uuid(),
  event: z.enum(TRACK_EVENTS),
  path: z.string().startsWith("/").max(300),
  referrerHost: z.string().max(200).nullable().optional(),
  utm: z.record(z.string(), z.string().max(160)).optional(),
  props: z.record(z.string(), z.union([z.string().max(120), z.number(), z.boolean()])).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 204 });
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`track:${ip}`, 120, 60) || !adminConfigured()) return new NextResponse(null, { status: 204 });

  const { sessionId, event, path, referrerHost, utm, props } = parsed.data;
  const { error } = await createAdminClient().from("analytics_events").insert({
    session_id: sessionId,
    event_name: event,
    path: path.split("?")[0],
    referrer_host: referrerHost ?? null,
    utm_source: utm?.utm_source ?? null,
    utm_medium: utm?.utm_medium ?? null,
    utm_campaign: utm?.utm_campaign ?? null,
    properties: props ?? {},
  });
  if (error) console.error("[track] insert failed", error.message);
  return new NextResponse(null, { status: 204 });
}
