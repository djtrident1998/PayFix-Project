import { NextResponse } from "next/server";
import { getUser, unauthorizedResponse } from "@/lib/auth";
import { describeFetchError } from "@/lib/safe-error";

// SECURITY: N8N_CASES_URL and N8N_API_KEY are server-only. They are read here
// via process.env, never logged and never included in any response.

export const dynamic = "force-dynamic";

const GENERIC = { error: "Something went wrong, please try again." };
const TIMEOUT_MS = 30_000;

// Personal data that must never reach the browser.
const PRIVATE_FIELDS = ["email", "customer_email"];

function toRows(data: unknown): Record<string, unknown>[] {
  let rows: unknown = data;
  if (rows && !Array.isArray(rows) && typeof rows === "object") {
    const obj = rows as Record<string, unknown>;
    rows = obj.data ?? obj.cases ?? obj.rows ?? (obj.ticket_id ? [obj] : []);
  }
  if (!Array.isArray(rows)) return [];
  return rows.filter((r): r is Record<string, unknown> => !!r && typeof r === "object");
}

export async function GET() {
  // Must be logged in (verified with Supabase, not just a cookie check).
  if (!(await getUser())) return unauthorizedResponse();

  // trim(): a pasted env value often carries a hidden trailing space or newline.
  const url = process.env.N8N_CASES_URL?.trim();
  const apiKey = process.env.N8N_API_KEY?.trim();
  if (!url || !apiKey) {
    console.error("[api/cases] env vars missing: restart the dev server after editing .env.local");
    return NextResponse.json(GENERIC, { status: 502 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "x-api-key": apiKey },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      const snippet = (await res.text().catch(() => "")).replace(/\s+/g, " ").slice(0, 160);
      console.error(
        `[api/cases] n8n responded with HTTP ${res.status} (server: ${res.headers.get("server") ?? "unknown"}) body: ${snippet}`
      );
      return NextResponse.json(GENERIC, { status: 502 });
    }

    const data: unknown = await res.json();

    // Strip email from every row on the server before it reaches the client.
    const sanitised = toRows(data).map((row) => {
      const clean: Record<string, unknown> = { ...row };
      for (const field of PRIVATE_FIELDS) delete clean[field];
      return clean;
    });

    return NextResponse.json(sanitised, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error(`[api/cases] request to n8n failed: ${describeFetchError(err)}`);
    return NextResponse.json(GENERIC, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
