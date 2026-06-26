/**
 * Lightweight in-memory rate limiter + automatic IP banning.
 *
 * NOTE ON SCALABILITY:
 * This is an application-level "second line of defense". On Cloudflare the
 * primary, truly scalable DDoS / rate-limiting protection is the edge WAF
 * (Rate Limiting Rules + managed DDoS mitigation) which runs before the
 * request ever reaches the Worker. See DEPLOYMENT.md.
 *
 * Because a Worker runs in many isolates, the in-memory store here is
 * best-effort per-isolate. For strict global limits across the fleet, back
 * this with Durable Objects or KV (hooks left as TODO below).
 */

export interface RateLimitRule {
  /** Max requests allowed within the window. */
  limit: number
  /** Window length in milliseconds. */
  windowMs: number
  /** If a client exceeds the limit this many times, it gets banned. */
  banThreshold?: number
  /** How long an automatic ban lasts, in milliseconds. */
  banMs?: number
}

interface Counter {
  count: number
  resetAt: number
  strikes: number
}

const counters = new Map<string, Counter>()
const bans = new Map<string, number>() // ip -> ban-expiry timestamp

// Opportunistic cleanup so the maps don't grow unbounded under attack.
let lastSweep = 0
function sweep(now: number) {
  if (now - lastSweep < 30_000) return
  lastSweep = now
  for (const [key, c] of counters) {
    if (c.resetAt < now) counters.delete(key)
  }
  for (const [ip, exp] of bans) {
    if (exp < now) bans.delete(ip)
  }
}

/** Statically banned IPs supplied via the BANNED_IPS env var (comma separated). */
function staticBanList(): Set<string> {
  const raw = process.env.BANNED_IPS ?? ''
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  )
}

export interface RateLimitResult {
  allowed: boolean
  /** True when the client is banned (static or automatic). */
  banned: boolean
  remaining: number
  limit: number
  /** Unix ms timestamp when the current window resets. */
  resetAt: number
  /** Seconds the client should back off (set when blocked). */
  retryAfter: number
}

export function checkRateLimit(
  ip: string,
  rule: RateLimitRule,
  bucket = 'global'
): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const {
    limit,
    windowMs,
    banThreshold = 5,
    banMs = 15 * 60_000,
  } = rule

  // 1. Static ban list (operator-controlled).
  if (staticBanList().has(ip)) {
    return {
      allowed: false,
      banned: true,
      remaining: 0,
      limit,
      resetAt: now + banMs,
      retryAfter: Math.ceil(banMs / 1000),
    }
  }

  // 2. Active automatic ban.
  const banExpiry = bans.get(ip)
  if (banExpiry && banExpiry > now) {
    return {
      allowed: false,
      banned: true,
      remaining: 0,
      limit,
      resetAt: banExpiry,
      retryAfter: Math.ceil((banExpiry - now) / 1000),
    }
  }

  // 3. Fixed-window counter, scoped per bucket so different route groups
  //    (e.g. auth vs general) can have independent budgets.
  const key = `${bucket}:${ip}`
  let counter = counters.get(key)
  if (!counter || counter.resetAt < now) {
    counter = { count: 0, resetAt: now + windowMs, strikes: counter?.strikes ?? 0 }
    counters.set(key, counter)
  }

  counter.count++

  if (counter.count > limit) {
    counter.strikes++
    // Repeated abuse within/across windows escalates to a temporary ban.
    if (counter.strikes >= banThreshold) {
      bans.set(ip, now + banMs)
      counter.strikes = 0
    }
    return {
      allowed: false,
      banned: false,
      remaining: 0,
      limit,
      resetAt: counter.resetAt,
      retryAfter: Math.ceil((counter.resetAt - now) / 1000),
    }
  }

  return {
    allowed: true,
    banned: false,
    remaining: Math.max(0, limit - counter.count),
    limit,
    resetAt: counter.resetAt,
    retryAfter: 0,
  }
}

/** Resolve the real client IP from common proxy / Cloudflare headers. */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}
