import "server-only";
import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "./supabase/server";
import { getSupabaseEnv } from "./supabase/env";

/**
 * Verified current user, or null. getUser() asks the Supabase Auth server to
 * validate the token, so this is the check API routes rely on. It is stronger
 * than the cookie-only check in proxy.ts.
 */
export async function getUser(): Promise<User | null> {
  if (!getSupabaseEnv()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    return error ? null : data.user;
  } catch {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
}
