import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Runs before every matched request (this is "middleware" in older Next.js).
 * 1. Refreshes the Supabase session cookie.
 * 2. Sends signed-out visitors to /login, and answers API calls with 401.
 *
 * This is a fast first gate. API routes verify the user again themselves.
 */

const PUBLIC_PATHS = ["/login", "/auth/callback"];

export async function proxy(request: NextRequest) {
  const env = getSupabaseEnv();
  if (!env) {
    // Fail closed: never serve the app unprotected because of a config mistake.
    return new NextResponse(
      "Login is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the server.",
      { status: 503 }
    );
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Verifies the JWT and refreshes it if it is about to expire.
  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;

  const { pathname, search } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // Redirects must carry over any refreshed session cookies.
  const withCookies = (res: NextResponse) => {
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (pathname.startsWith("/api/")) {
    if (!signedIn) {
      return withCookies(
        NextResponse.json({ error: "Please log in to continue." }, { status: 401 })
      );
    }
    return response;
  }

  if (!signedIn && !isPublic) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    if (pathname !== "/") login.searchParams.set("next", pathname + search);
    return withCookies(NextResponse.redirect(login));
  }

  if (signedIn && pathname === "/login") {
    const home = request.nextUrl.clone();
    home.pathname = "/";
    home.search = "";
    return withCookies(NextResponse.redirect(home));
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
