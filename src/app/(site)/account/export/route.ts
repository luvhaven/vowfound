import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";

/** Everything we hold about the signed-in member, as one JSON file. */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "signed_out" }, { status: 401 });
  const supabase = await createClient();
  const [member, checks, orders] = await Promise.all([
    supabase.from("members").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("readiness_checks").select("*").eq("member_id", user.id),
    supabase.from("orders").select("*").eq("member_id", user.id),
  ]);
  const body = JSON.stringify({ exported_at: new Date().toISOString(), member: member.data, readiness_checks: checks.data, orders: orders.data }, null, 2);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="vowfound-my-data.json"',
      "Cache-Control": "no-store",
    },
  });
}
