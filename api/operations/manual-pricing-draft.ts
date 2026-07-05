import { validateAdminRequest } from '../_shared/admin-auth'
import { getAdminOrderByOrderId } from '../_shared/admin-orders'
import { applyJsonHeaders } from '../_shared/headers'
import { logEvent } from '../_shared/logger'
import { validateOperationsManualPricingDraftBody } from '../_shared/operations-manual-pricing-draft-validation'
import { upsertOperationsManualPricingDraft } from '../_shared/operations-manual-pricing-drafts-store'
import { applyRequestIdHeader, getRequestId } from '../_shared/request-context'
import type { ServerlessRequest, ServerlessResponse } from '../_shared/serverless-types'

const SAVE_UNAVAILABLE_MESSAGE = 'Manual pricing draft is temporarily unavailable.'
const ORDER_NOT_FOUND_MESSAGE = 'Order not found'

function parseBody(body: unknown): unknown {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as unknown
    } catch {
      return null
    }
  }
  return body
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const requestId = getRequestId(req)
  applyRequestIdHeader(res, requestId)
  applyJsonHeaders(res)
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Admin-Key, Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed' })

  const auth = validateAdminRequest(req)
  if (auth.ok === false) return res.status(auth.status).json({ ok: false, message: auth.message })

  const validated = validateOperationsManualPricingDraftBody(parseBody(req.body))
  if (!validated.ok) {
    return res.status(400).json({ ok: false, message: validated.message })
  }

  try {
    const order = await getAdminOrderByOrderId(validated.value.orderId)
    if (!order) {
      return res.status(404).json({ ok: false, message: ORDER_NOT_FOUND_MESSAGE })
    }

    const saved = await upsertOperationsManualPricingDraft(validated.value, auth.authType === 'session' ? 'admin' : 'admin')
    if (!saved.ok) {
      logEvent('error', 'operations_manual_pricing_draft.save_failed', {
        requestId,
        orderId: validated.value.orderId,
        reason: saved.error.slice(0, 300),
      })
      return res.status(500).json({ ok: false, message: SAVE_UNAVAILABLE_MESSAGE })
    }

    logEvent('info', 'operations_manual_pricing_draft.saved', {
      requestId,
      orderId: validated.value.orderId,
    })

    return res.status(200).json({ ok: true, manualPricingDraft: saved.draft })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logEvent('error', 'operations_manual_pricing_draft.save_failed', {
      requestId,
      reason: message.slice(0, 300),
    })
    return res.status(500).json({ ok: false, message: SAVE_UNAVAILABLE_MESSAGE })
  }
}
