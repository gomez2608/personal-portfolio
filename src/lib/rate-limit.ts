// Simple in-memory sliding-window rate limiter. It resets on cold starts and isn't shared
// across instances; swap in Upstash if that matters. The returned function records a hit
// for `key` and returns true when the key is over the limit.
export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, number[]>();

  return function rateLimited(key: string, now: number = Date.now()): boolean {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    // Keep the map from growing without bound on a long-lived instance.
    if (hits.size > 5000) {
      for (const [k, times] of hits) {
        if (times.every((t) => now - t >= windowMs)) hits.delete(k);
      }
    }
    return recent.length > max;
  };
}
