import { NextRequest, NextResponse } from "next/server";
import { disputeSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import { getUser, unauthorizedResponse } from "@/lib/auth";

// SECURITY: N8N_DISPUTE_URL and N8N_API_KEY are server-only. They are read here
// via process.env, never logged and never included in any response.

export const maxDuration = 60;

const GENERIC = { error: "Something went wrong, please try again." };
const TIMEOUT_MS = 60_000;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  // --- Must be logged in (verified with Supabase, not just a cookie check) ---
  if (!(await getUser())) return unauthorizedResponse();

  // --- Rate limit (in-memory, resets on cold start; see lib/rate-limit.ts) ---
  const { allowed, retryAfterMs } = checkRateLimit(clientIp(request));
  if (!allowed) {
    const minutes = Math.max(1, Math.ceil(retryAfterMs / 60_000));
    return NextResponse.json(
      {
        error: `You've raised quite a few disputes. Please take a breather and try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  // --- Validate body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  const parsed = disputeSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString();
      if (field && !errors[field]) errors[field] = issue.message;
    }
    return NextResponse.json(
      { error: "Please check the form and try again.", errors },
      { status: 400 }
    );
  }

  const url = process.env.N8N_DISPUTE_URL;
  const apiKey = process.env.N8N_API_KEY;
  if (!url || !apiKey) {
    console.error("[api/dispute] env vars missing: restart the dev server after editing .env.local");
    return NextResponse.json(GENERIC, { status: 502 });
  }

  // --- Forward to n8n with a 60s timeout ---
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(parsed.data),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      // Server-side log only: status code, never URLs, headers or keys.
      console.error(`[api/dispute] n8n responded with HTTP ${res.status}`);
      return NextResponse.json(GENERIC, { status: 502 });
    }

    const data: unknown = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    // Network error, timeout (AbortError) or non-JSON body. The browser gets no
    // details; the server log gets only the error type.
    console.error(`[api/dispute] request to n8n failed: ${err instanceof Error ? err.name : "unknown"}`);
    return NextResponse.json(GENERIC, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
