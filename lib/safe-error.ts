/**
 * Turns a fetch() failure into a short label that is safe to put in server logs.
 *
 * It deliberately never includes err.message: Node's messages can echo the
 * offending URL or header value, which would leak an n8n URL or API key.
 */
export function describeFetchError(err: unknown): string {
  if (!(err instanceof Error)) return "unknown";

  if (err.name === "AbortError" || err.name === "TimeoutError") return "timeout";

  const msg = err.message.toLowerCase();
  const cause = (err as { cause?: { code?: unknown } }).cause;
  const code = typeof cause?.code === "string" ? cause.code : "";

  if (msg.includes("invalid header")) {
    return "invalid header value (check N8N_API_KEY for a stray space, newline or quote)";
  }
  if (msg.includes("parse url") || msg.includes("invalid url")) {
    return "invalid URL (check the N8N_*_URL values for a stray space or quote)";
  }
  if (msg.includes("fetch failed")) {
    return `network error${code ? ` (${code})` : ""}`;
  }
  return err.name;
}
