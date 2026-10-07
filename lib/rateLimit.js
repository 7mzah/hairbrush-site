// Tiny in-memory sliding-window limiter: enough for a single-instance deploy
// (VPS / Railway / Render). Resets on restart and is not shared across replicas.
const buckets = new Map();
const MAX_KEYS = 10_000;

function prune(now, windowMs) {
  for (const [key, hits] of buckets) {
    const alive = hits.filter((t) => now - t < windowMs);
    if (alive.length) buckets.set(key, alive);
    else buckets.delete(key);
  }
}

/** Returns true when the request is allowed, false when the key is over the limit. */
export function rateLimit(key, { limit = 3, windowMs = 60_000 } = {}) {
  const now = Date.now();
  if (buckets.size >= MAX_KEYS) prune(now, windowMs);
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

/** Client IP behind a proxy. x-forwarded-for is the left-most entry. */
export function clientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  return forwarded.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}
