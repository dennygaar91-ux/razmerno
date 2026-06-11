import { createAdminSessionToken, validateAdminLogin } from '../_shared/admin-auth'
import { applyJsonHeaders } from '../_shared/headers'
import { logEvent } from '../_shared/logger'
import { applyRequestIdHeader, getRequestId } from '../_shared/request-context'
import { ADMIN_LOGIN_RATE_LIMIT, checkRateLimit } from '../_shared/rate-limit'
import { RateLimitError, sendApiError } from '../_shared/errors'
import { ApiEvents } from '../_shared/events'

type ServerlessRequest = {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body: unknown
}

type ServerlessResponse = {
  setHeader(name: string, value: string): void
  status(code: number): {
    json(payload: unknown): void
    end(): void
  }
}

type LoginBody = {
  password?: unknown
}

function parseBody(body: unknown): LoginBody {
  if (!body || typeof body !== 'object') return {}
  return body as LoginBody
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const requestId = getRequestId(req)
  applyRequestIdHeader(res, requestId)
  applyJsonHeaders(res)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed' })

  const rateLimit = await checkRateLimit(req, ADMIN_LOGIN_RATE_LIMIT)
  res.setHeader('X-RateLimit-Limit', String(rateLimit.limit))
  res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining))
  if (!rateLimit.ok) {
    logEvent('warn', ApiEvents.adminLoginRateLimited, { requestId })
    return sendApiError(res, new RateLimitError('Слишком много попыток входа. Попробуйте позже.', rateLimit.retryAfterSec), requestId)
  }

  const body = parseBody(req.body)
  const password = typeof body.password === 'string' ? body.password : ''

  if (!validateAdminLogin(password)) {
    logEvent('warn', ApiEvents.adminLoginFailed, { requestId })
    return res.status(401).json({ ok: false, message: 'Неверный пароль' })
  }

  try {
    const token = createAdminSessionToken()
    logEvent('info', ApiEvents.adminLoginSuccess, { requestId })
    return res.status(200).json({ ok: true, token, expiresInSec: 60 * 60 * 8 })
  } catch {
    logEvent('error', ApiEvents.adminLoginNotConfigured, { requestId })
    return res.status(500).json({ ok: false, message: 'Admin auth is not configured' })
  }
}
