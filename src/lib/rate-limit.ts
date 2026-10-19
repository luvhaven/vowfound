import "server-only";

/* A small in-memory window. It is per-instance, which is enough to stop a
   form being hammered from one connection; it is not a security boundary. */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowSeconds: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowSeconds * 1000);
  if (recent.length >= limit) return false;
  recent.push(now);
  hits.set(key, recent);
  return true;
}
