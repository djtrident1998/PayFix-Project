/**
 * Simple in-memory, fixed-window rate limiter for /api/dispute.
 * 5 requests per IP per 10 minutes.
 *
 * NOTE: This Map lives in the memory of a single server instance. It RESETS on
 * every cold start / redeploy, and is not shared between serverless instances.
 * Good enough for a portfolio demo; use Redis / Upstash for real production.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 25;

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();

  if (rateLimitMap.size > 5000) {
    for (const [key, val] of rateLimitMap) {
      if (val.resetAt <= now) rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}
