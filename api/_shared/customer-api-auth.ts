import { verifyCustomerAccessToken, type VerifiedCustomer } from './customer-auth'
import { applyCustomerCorsHeaders, extractBearerToken } from './customer-cors'
import { applyNoStoreHeaders } from './headers'
import { logEvent } from './logger'
import { isAllowedOrigin, getHeader } from './order-cors'
import { applyRequestIdHeader, getRequestId } from './request-context'
import type { ServerlessRequest, ServerlessResponse } from './serverless-types'

export const CUSTOMER_UNAUTHORIZED_MESSAGE = 'Требуется авторизация.'
export const CUSTOMER_API_UNAVAILABLE_MESSAGE = 'Сервис временно недоступен. Попробуйте позже.'

export type AuthorizedCustomerContext = {
  requestId: string
  user: VerifiedCustomer
  accessToken: string
}

export function assertCustomerApiEnvReady(): string[] {
  const missing: string[] = []
  if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  return missing
}

export function parseCustomerApiBody(body: unknown): unknown {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return null
    }
  }
  return body
}

export function prepareCustomerApi(
  req: ServerlessRequest,
  res: ServerlessResponse,
  allowedMethods: string[],
): { requestId: string } | null {
  const requestId = getRequestId(req)
  applyRequestIdHeader(res, requestId)
  applyNoStoreHeaders(res)
  applyCustomerCorsHeaders(req, res)

  const origin = getHeader(req, 'origin')
  if (!isAllowedOrigin(origin)) {
    logEvent('warn', 'customer_api.origin_rejected', { requestId, origin })
    res.status(403).json({ ok: false, message: 'Forbidden origin' })
    return null
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return null
  }

  if (!req.method || !allowedMethods.includes(req.method)) {
    res.status(405).json({ ok: false, message: 'Method not allowed' })
    return null
  }

  return { requestId }
}

export async function authorizeCustomerApi(
  req: ServerlessRequest,
  res: ServerlessResponse,
  requestId: string,
): Promise<AuthorizedCustomerContext | null> {
  const accessToken = extractBearerToken(req)
  if (!accessToken) {
    res.status(401).json({ ok: false, message: CUSTOMER_UNAUTHORIZED_MESSAGE })
    return null
  }

  const missingEnv = assertCustomerApiEnvReady()
  if (missingEnv.length > 0) {
    logEvent('error', 'customer_api.env_missing', { requestId, missing: missingEnv })
    res.status(503).json({ ok: false, message: CUSTOMER_API_UNAVAILABLE_MESSAGE })
    return null
  }

  const user = await verifyCustomerAccessToken(accessToken)
  if (!user) {
    res.status(401).json({ ok: false, message: CUSTOMER_UNAUTHORIZED_MESSAGE })
    return null
  }

  return { requestId, user, accessToken }
}

export function readQueryFlag(value: string | string[] | undefined): boolean {
  const raw = Array.isArray(value) ? value[0] : value
  return raw === '1' || raw === 'true'
}

export function readQueryString(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value
  return raw?.trim() ?? ''
}
