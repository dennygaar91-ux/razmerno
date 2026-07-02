import { verifyCustomerAccessToken } from './_shared/customer-auth'
import { applyCustomerCorsHeaders, extractBearerToken } from './_shared/customer-cors'
import { validateCustomerProfilePatch } from './_shared/customer-profile'
import { ensureCustomerProfile, updateCustomerProfile } from './_shared/customer-profiles'
import { applyNoStoreHeaders } from './_shared/headers'
import { logEvent } from './_shared/logger'
import { isAllowedOrigin, getHeader } from './_shared/order-cors'
import { applyRequestIdHeader, getRequestId } from './_shared/request-context'
import type { ServerlessRequest, ServerlessResponse } from './_shared/serverless-types'

const UNAUTHORIZED_MESSAGE = 'Требуется авторизация.'
const PROFILE_UNAVAILABLE_MESSAGE = 'Профиль временно недоступен. Попробуйте позже.'

function parseBody(body: unknown): unknown {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return null
    }
  }
  return body
}

function assertProfileEnvReady(): string[] {
  const missing: string[] = []
  if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  return missing
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const requestId = getRequestId(req)
  applyRequestIdHeader(res, requestId)
  applyNoStoreHeaders(res)
  applyCustomerCorsHeaders(req, res)

  const origin = getHeader(req, 'origin')
  if (!isAllowedOrigin(origin)) {
    logEvent('warn', 'profile.origin_rejected', { requestId, origin })
    return res.status(403).json({ ok: false, message: 'Forbidden origin' })
  }

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' })
  }

  const accessToken = extractBearerToken(req)
  if (!accessToken) {
    return res.status(401).json({ ok: false, message: UNAUTHORIZED_MESSAGE })
  }

  let patchValidation: ReturnType<typeof validateCustomerProfilePatch> | null = null
  if (req.method === 'PATCH') {
    patchValidation = validateCustomerProfilePatch(parseBody(req.body))
    if (!patchValidation.ok) {
      return res.status(400).json({ ok: false, message: patchValidation.message })
    }
  }

  const missingEnv = assertProfileEnvReady()
  if (missingEnv.length > 0) {
    logEvent('error', 'profile.env_missing', { requestId, missing: missingEnv })
    return res.status(503).json({ ok: false, message: PROFILE_UNAVAILABLE_MESSAGE })
  }

  const verified = await verifyCustomerAccessToken(accessToken)
  if (!verified) {
    return res.status(401).json({ ok: false, message: UNAUTHORIZED_MESSAGE })
  }

  if (req.method === 'GET') {
    const ensured = await ensureCustomerProfile({
      userId: verified.userId,
      email: verified.email,
      fullName: verified.fullName,
    })

    if (!ensured.ok) {
      logEvent('error', 'profile.ensure_failed', { requestId, userId: verified.userId, reason: ensured.error })
      return res.status(500).json({ ok: false, message: PROFILE_UNAVAILABLE_MESSAGE })
    }

    return res.status(200).json({ ok: true, profile: ensured.profile })
  }

  if (req.method === 'PATCH') {
    const ensured = await ensureCustomerProfile({
      userId: verified.userId,
      email: verified.email,
      fullName: verified.fullName,
    })
    if (!ensured.ok) {
      logEvent('error', 'profile.ensure_failed_before_patch', {
        requestId,
        userId: verified.userId,
        reason: ensured.error,
      })
      return res.status(500).json({ ok: false, message: PROFILE_UNAVAILABLE_MESSAGE })
    }
  }

  const updated = await updateCustomerProfile(verified.userId, patchValidation!.patch)
  if (!updated.ok) {
    logEvent('error', 'profile.patch_failed', { requestId, userId: verified.userId, reason: updated.error })
    return res.status(500).json({ ok: false, message: PROFILE_UNAVAILABLE_MESSAGE })
  }

  return res.status(200).json({ ok: true, profile: updated.profile })
}
