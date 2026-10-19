import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";

/** Exchanges the emailed code for a session, then attaches any Readiness
 *  Checks taken with this email before the account existed. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next") ?? "/account";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      if (adminConfigured() && data.user.email) {
        await createAdminClient()
          .from("readiness_checks")
          .update({ member_id: data.user.id })
          .is("member_id", null)
          .ilike("email", data.user.email);
        await createAdminClient()
          .from("orders")
          .update({ member_id: data.user.id })
          .is("member_id", null)
          .ilike("email", data.user.email);
      }
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/sign-in?error=link", url.origin));
}
