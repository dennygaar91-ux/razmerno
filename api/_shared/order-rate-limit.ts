import type { ServerlessRequest } from './serverless-types'
import { logEvent, safeErrorMessage } from './logger'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 8
const memoryBucket = new Map<string, { count: number; resetAt: number }>()

export function getClientKey(req: ServerlessRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]
  return (ip || req.socket.remoteAddress || 'unknown').trim()
}

function isMemoryRateLimited(key: string): boolean {
  const now = Date.now()
  const bucket = memoryBucket.get(key)
  if (!bucket || bucket.resetAt < now) {
    memoryBucket.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  bucket.count += 1
  return bucket.count > RATE_LIMIT_MAX
}

async function isUpstashRateLimited(key: string): Promise<boolean | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const bucketKey = `rate:orders:${key}`
  const endpoint = url.replace(/\/$/, '')

  const incrResponse = await fetch(`${endpoint}/incr/${encodeURIComponent(bucketKey)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!incrResponse.ok) throw new Error(`Upstash incr failed ${incrResponse.status}`)

  const incrData = await incrResponse.json() as { result?: number }
  const count = Number(incrData.result ?? 0)

  if (count === 1) {
    const expireSeconds = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
    await fetch(`${endpoint}/expire/${encodeURIComponent(bucketKey)}/${expireSeconds}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  return count > RATE_LIMIT_MAX
}

export async function isRateLimited(key: string): Promise<boolean> {
  try {
    const upstashResult = await isUpstashRateLimited(key)
    if (upstashResult !== null) return upstashResult
  } catch (error) {
    logEvent('error', 'orders.rate_limit_upstash_failed', { reason: safeErrorMessage(error) })
  }

  return isMemoryRateLimited(key)
}
