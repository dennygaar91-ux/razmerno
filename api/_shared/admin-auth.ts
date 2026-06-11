import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { logEvent } from './logger'
import { ApiEvents } from './events'

type HeaderBag = Record<string, string | string[] | undefined>

export type AdminRequestLike = {
  headers: HeaderBag
}

export type AdminSessionPayload = {
  sub: 'admin'
  role: 'admin'
  exp: number
  iat: number
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 8

function readHeader(headers: HeaderBag, name: string): string | null {
  const direct = headers[name] ?? headers[name.toLowerCase()]
  if (Array.isArray(direct)) return direct[0] ?? null
  return direct ?? null
}

function safeCompare(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function base64url(input: string): string {
  return Buffer.from(input).toString('base64url')
}

function unbase64url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8')
}

export function getAdminApiKey(): string {
  return process.env.ADMIN_API_KEY || ''
}

export function getAdminPasswordHash(): string {
  return process.env.ADMIN_PASSWORD_HASH || ''
}

export function hashAdminPassword(password: string): string {
  return createHash('sha256').update(password, 'utf8').digest('hex')
}

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

export function createAdminSessionToken(now = Date.now()): string {
  const secret = getAdminApiKey().trim()
  if (secret.length < 24) throw new Error('Admin API key is not configured')

  const payload: AdminSessionPayload = {
    sub: 'admin',
    role: 'admin',
    iat: now,
    exp: now + SESSION_TTL_MS,
  }

  const encoded = base64url(JSON.stringify(payload))
  const signature = sign(encoded, secret)
  return `${encoded}.${signature}`
}

export function verifyAdminSessionToken(token: string, now = Date.now()): AdminSessionPayload | null {
  const secret = getAdminApiKey().trim()
  if (secret.length < 24) return null

  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return null

  const expected = sign(encoded, secret)
  if (!safeCompare(signature, expected)) return null

  try {
    const payload = JSON.parse(unbase64url(encoded)) as AdminSessionPayload
    if (payload.sub !== 'admin' || payload.role !== 'admin') return null
    if (!Number.isFinite(payload.exp) || payload.exp < now) return null
    return payload
  } catch {
    return null
  }
}

export function validateAdminLogin(password: string): boolean {
  const expectedHash = getAdminPasswordHash().trim().toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(expectedHash)) return false
  const actualHash = hashAdminPassword(password)
  return safeCompare(actualHash, expectedHash)
}

export function validateAdminRequest(req: AdminRequestLike): { ok: true; authType: 'api-key' | 'session' } | { ok: false; status: number; message: string } {
  const expectedKey = getAdminApiKey().trim()
  if (expectedKey.length < 24) {
    logEvent('error', ApiEvents.adminAuthKeyNotConfigured, {})
    return { ok: false as const, status: 500, message: 'Admin API key is not configured' }
  }

  const bearer = readHeader(req.headers, 'authorization')?.replace(/^Bearer\s+/i, '').trim() ?? ''
  const explicit = readHeader(req.headers, 'x-admin-key')?.trim() ?? ''

  if (explicit && safeCompare(explicit, expectedKey)) {
    return { ok: true as const, authType: 'api-key' }
  }

  if (bearer && safeCompare(bearer, expectedKey)) {
    return { ok: true as const, authType: 'api-key' }
  }

  if (bearer && verifyAdminSessionToken(bearer)) {
    return { ok: true as const, authType: 'session' }
  }

  logEvent('warn', ApiEvents.adminAuthRejected, {})
  return { ok: false as const, status: 401, message: 'Unauthorized' }
}
