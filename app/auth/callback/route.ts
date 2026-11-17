import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth-utils";

/**
 * Landing point for the email-confirmation link. Supabase redirects here with
 * a one-time ?code=; we swap it for a session cookie, then send the user on.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, request.url));
    } catch {
      // fall through to the error redirect
    }
  }

  return NextResponse.redirect(new URL("/login?error=confirm", request.url));
}
