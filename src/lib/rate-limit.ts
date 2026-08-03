import "server-only";

/**
 * In-memory fixed-window limiter. Adequate for a single instance and for
 * development; on a multi-instance deployment set UPSTASH_REDIS_REST_URL and
 * swap the body of this function for a shared counter. The call sites do not
 * change.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }

  if (existing.count >= limit) return false;

  existing.count += 1;
  return true;
}
