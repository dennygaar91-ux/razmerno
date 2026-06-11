import { getClientIpHash, type RequestLike } from './request-context'

type Bucket = {
  count: number
  resetAt: number
}

export type RateLimitResult = {
  ok: boolean
  key: string
  limit: number
  remaining: number
  resetAt: number
  retryAfterSec: number
  adapter: 'memory' | 'upstash-ready'
}

export type RateLimitPolicy = {
  namespace: string
  limit: number
  windowMs: number
}

export type RateLimitAdapter = {
  name: RateLimitResult['adapter']
  check(req: RequestLike, policy: RateLimitPolicy): Promise<RateLimitResult> | RateLimitResult
}

const memoryBuckets = new Map<string, Bucket>()

function nowMs(): number {
  return Date.now()
}

function cleanupExpired(now: number) {
  for (const [key, bucket] of memoryBuckets.entries()) {
    if (bucket.resetAt <= now) memoryBuckets.delete(key)
  }
}

function buildKey(req: RequestLike, policy: RateLimitPolicy): string {
  return `${policy.namespace}:${getClientIpHash(req)}`
}

export const memoryRateLimitAdapter: RateLimitAdapter = {
  name: 'memory',
  check(req, policy) {
    const now = nowMs()
    cleanupExpired(now)

    const key = buildKey(req, policy)
    const current = memoryBuckets.get(key)

    if (!current || current.resetAt <= now) {
      memoryBuckets.set(key, { count: 1, resetAt: now + policy.windowMs })
      return {
        ok: true,
        key,
        limit: policy.limit,
        remaining: Math.max(policy.limit - 1, 0),
        resetAt: now + policy.windowMs,
        retryAfterSec: 0,
        adapter: 'memory',
      }
    }

    current.count += 1
    const remaining = Math.max(policy.limit - current.count, 0)
    const retryAfterSec = Math.max(Math.ceil((current.resetAt - now) / 1000), 1)

    return {
      ok: current.count <= policy.limit,
      key,
      limit: policy.limit,
      remaining,
      resetAt: current.resetAt,
      retryAfterSec,
      adapter: 'memory',
    }
  },
}

export function hasUpstashEnv(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

export function getRateLimitAdapter(): RateLimitAdapter {
  // Upstash adapter hook is intentionally prepared but not enabled without adding runtime fetch semantics/tests.
  // For now serverless production uses memory fallback unless a future Stage adds the Redis adapter.
  return memoryRateLimitAdapter
}

export function checkRateLimit(req: RequestLike, policy: RateLimitPolicy): Promise<RateLimitResult> | RateLimitResult {
  return getRateLimitAdapter().check(req, policy)
}

// Backward-compatible alias used by existing login endpoint.
export function checkMemoryRateLimit(req: RequestLike, policy: RateLimitPolicy): RateLimitResult {
  return memoryRateLimitAdapter.check(req, policy) as RateLimitResult
}

export const ADMIN_LOGIN_RATE_LIMIT: RateLimitPolicy = {
  namespace: 'admin-login',
  limit: 5,
  windowMs: 1000 * 60 * 10,
}
