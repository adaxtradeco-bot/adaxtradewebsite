/**
 * Small in-memory sliding-window rate limiter.
 *
 * NOTE: state lives in the memory of a single server instance. On serverless
 * hosting (Vercel) every warm instance has its own map and cold starts reset
 * it, so this is a best-effort brake against brute force / spam, not a hard
 * global quota. Use a shared store (Redis, Upstash, ...) if that is needed.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Hits still allowed in the current window. */
  remaining: number;
  /** Seconds until another hit is allowed (0 when allowed). */
  retryAfterSeconds: number;
}

export interface RateLimiterOptions {
  /** Max hits per key inside the window. */
  limit: number;
  windowMs: number;
  /** Upper bound on tracked keys; oldest keys are evicted beyond this. */
  maxKeys?: number;
  /** Injectable clock for tests. */
  now?: () => number;
}

export interface RateLimiter {
  /** Inspect a key without recording a hit. */
  check(key: string): RateLimitResult;
  /** Record a hit for a key and report whether it was within the limit. */
  hit(key: string): RateLimitResult;
  /** Forget a key (e.g. after a successful login). */
  reset(key: string): void;
  /** Number of tracked keys (for tests / diagnostics). */
  size(): number;
}

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
  now = Date.now,
}: RateLimiterOptions): RateLimiter {
  // Map keeps insertion order; keys are re-inserted on every hit, so the
  // first entries are always the least recently used ones.
  const hits = new Map<string, number[]>();

  const recent = (key: string, at: number): number[] => {
    const list = hits.get(key);
    if (!list) return [];
    const fresh = list.filter((t) => at - t < windowMs);
    if (fresh.length === 0) hits.delete(key);
    else if (fresh.length !== list.length) hits.set(key, fresh);
    return fresh;
  };

  const result = (list: number[], at: number): RateLimitResult => {
    if (list.length < limit) {
      return { allowed: true, remaining: limit - list.length, retryAfterSeconds: 0 };
    }
    // The window frees up when the oldest hit that keeps us at the limit expires.
    const oldestRelevant = list[list.length - limit];
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldestRelevant + windowMs - at) / 1000)),
    };
  };

  const evict = (at: number) => {
    if (hits.size <= maxKeys) return;
    for (const key of Array.from(hits.keys())) recent(key, at);
    while (hits.size > maxKeys) {
      const oldest = hits.keys().next().value;
      if (oldest === undefined) break;
      hits.delete(oldest);
    }
  };

  return {
    check(key) {
      const at = now();
      return result(recent(key, at), at);
    },
    hit(key) {
      const at = now();
      const list = recent(key, at);
      const before = result(list, at);
      if (!before.allowed) return before;
      list.push(at);
      hits.delete(key);
      hits.set(key, list);
      evict(at);
      return { allowed: true, remaining: limit - list.length, retryAfterSeconds: 0 };
    },
    reset(key) {
      hits.delete(key);
    },
    size() {
      return hits.size;
    },
  };
}

/**
 * Best-effort client IP: first hop of `x-forwarded-for`, then `x-real-ip`.
 * Both are set by the platform proxy (Vercel); without a proxy they can be
 * spoofed, which only weakens (not bypasses) the per-email limits.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  if (first) return first;
  const realIp = headers.get('x-real-ip')?.trim();
  return realIp || 'unknown';
}
