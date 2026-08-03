import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/account", "/admin"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((protectedPath) =>
    path.startsWith(protectedPath),
  );

  if (isProtected) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        if (isProtected) {
          response.headers.set(
            "X-Robots-Tag",
            "noindex, nofollow, noarchive",
          );
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = "/sign-in";
    signIn.searchParams.set("next", path);

    // The redirect is its own response, so it needs the header too — without
    // this, the one hop a crawler actually sees for /account is unmarked.
    const redirect = NextResponse.redirect(signIn);
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return redirect;
  }

  // An account provisioned with a temporary password cannot go anywhere else
  // until it has its own. Enforced here rather than in a layout so it covers
  // every authenticated route, including ones added later.
  const mustChange = Boolean(
    (user?.user_metadata as { must_change_password?: boolean } | undefined)
      ?.must_change_password,
  );

  if (user && mustChange && isProtected && path !== "/account/security") {
    const security = request.nextUrl.clone();
    security.pathname = "/account/security";
    security.search = "";
    const redirect = NextResponse.redirect(security);
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)",
  ],
};
