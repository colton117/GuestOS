import { headers } from "next/headers";

interface RateLimitBucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, RateLimitBucket>();

function pruneExpiredBuckets(now: number, windowMs: number) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > windowMs) {
      buckets.delete(key);
    }
  }
}

async function getClientIdentifier(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("cf-connecting-ip") ??
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/**
 * In-memory sliding-window limiter, scoped per-process. Fine for a single
 * EC2 instance; would need a shared store (Redis, DB) if this app ever ran
 * behind more than one app instance.
 */
export async function checkRateLimit(
  scope: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const identifier = await getClientIdentifier();
  const key = `${scope}:${identifier}`;
  const now = Date.now();

  pruneExpiredBuckets(now, windowMs);

  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (existing.count >= limit) {
    return false;
  }

  existing.count += 1;
  return true;
}
