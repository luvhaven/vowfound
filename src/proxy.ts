import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/account", "/admin"];

/** Refreshes the Supabase session on every request and guards member areas. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path.startsWith(p));
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });

  const { data } = await supabase.auth.getUser();

  if (isProtected) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    if (!data.user) {
      const signIn = request.nextUrl.clone();
      signIn.pathname = "/sign-in";
      signIn.search = `?next=${encodeURIComponent(path)}`;
      return NextResponse.redirect(signIn);
    }
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|api/webhooks|.*\.(?:png|jpg|svg|webp)$).*)"],
};
