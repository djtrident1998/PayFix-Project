import { createBrowserClient } from "@supabase/ssr";

/** Supabase client for Client Components (login form, sign-out). */
export function createClient() {
  // Direct property access so Next.js can inline the NEXT_PUBLIC_ values.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
