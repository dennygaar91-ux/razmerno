import { validateAdminRequest } from '../_shared/admin-auth'
import { createOperationsDecisionNotificationBestEffort } from '../_shared/customer-notification-events'
import { applyJsonHeaders } from '../_shared/headers'
import { logEvent } from '../_shared/logger'
import { applyOperationsOrderDecision } from '../_shared/operations-order-decision-store'
import { validateOperationsOrderDecisionBody } from '../_shared/operations-order-decision-validation'
import { buildOperationsOrderReviewByOrderId } from '../_shared/operations-order-review'
import { applyRequestIdHeader, getRequestId } from '../_shared/request-context'
import type { ServerlessRequest, ServerlessResponse } from '../_shared/serverless-types'

const DECISION_UNAVAILABLE_MESSAGE = 'Operations order decision is temporarily unavailable.'
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

  const validated = validateOperationsOrderDecisionBody(parseBody(req.body))
  if (!validated.ok) {
    return res.status(400).json({ ok: false, message: validated.message })
  }

  try {
    const applied = await applyOperationsOrderDecision(validated.value, 'operations')
    if (!applied.ok) {
      if (applied.reason === 'not_found') {
        return res.status(404).json({ ok: false, message: ORDER_NOT_FOUND_MESSAGE })
      }
      if (applied.reason === 'invalid_state') {
        return res.status(409).json({ ok: false, message: applied.message })
      }
      logEvent('error', 'operations_order_decision.apply_failed', {
        requestId,
        orderId: validated.value.orderId,
        decision: validated.value.decision,
        reason: applied.message.slice(0, 300),
      })
      return res.status(500).json({ ok: false, message: DECISION_UNAVAILABLE_MESSAGE })
    }

    const built = await buildOperationsOrderReviewByOrderId(validated.value.orderId)
    if (!built.ok) {
      logEvent('error', 'operations_order_decision.review_reload_failed', {
        requestId,
        orderId: validated.value.orderId,
        reason: built.message.slice(0, 300),
      })
      return res.status(200).json({
        ok: true,
        decision: applied.result,
        review: null,
        message: 'Decision applied, but review reload is temporarily unavailable.',
      })
    }

    logEvent('info', 'operations_order_decision.applied', {
      requestId,
      orderId: validated.value.orderId,
      decision: validated.value.decision,
      domainStatus: applied.result.domainStatus,
    })

    await createOperationsDecisionNotificationBestEffort({
      requestId,
      businessOrderId: validated.value.orderId,
      decision: validated.value.decision,
    })

    return res.status(200).json({
      ok: true,
      decision: applied.result,
      review: built.review,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logEvent('error', 'operations_order_decision.apply_failed', {
      requestId,
      orderId: validated.value.orderId,
      reason: message.slice(0, 300),
    })
    return res.status(500).json({ ok: false, message: DECISION_UNAVAILABLE_MESSAGE })
  }
}
