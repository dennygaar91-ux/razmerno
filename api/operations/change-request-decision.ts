import { validateAdminRequest } from '../_shared/admin-auth'
import { createChangeRequestDecisionNotificationBestEffort } from '../_shared/customer-notification-events'
import { getBusinessOrderIdByOrderUuid, getPublicOrderNumberByOrderUuid } from '../_shared/customer-orders-store'
import { applyJsonHeaders } from '../_shared/headers'
import { logEvent } from '../_shared/logger'
import {
  isFailureResult,
  isNotFoundResult,
  isReasonedFailureResult,
  readFailureError,
  readFailureMessage,
  readReasonedFailureMessage,
} from '../_shared/result-utils'
import {
  applyOperationsChangeRequestDecision,
  getOperationsChangeRequestById,
} from '../_shared/operations-change-request-store'
import { validateOperationsChangeRequestDecisionBody } from '../_shared/operations-change-request-validation'
import { buildOperationsOrderReviewByOrderId } from '../_shared/operations-order-review'
import { applyRequestIdHeader, getRequestId } from '../_shared/request-context'
import type { ServerlessRequest, ServerlessResponse } from '../_shared/serverless-types'

const DECISION_UNAVAILABLE_MESSAGE = 'Operations change request decision is temporarily unavailable.'
const CHANGE_REQUEST_NOT_FOUND_MESSAGE = 'Change request not found'

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

  const validated = validateOperationsChangeRequestDecisionBody(parseBody(req.body))
  if (isFailureResult(validated)) {
    return res.status(400).json({ ok: false, message: readFailureMessage(validated) })
  }

  try {
    const existing = await getOperationsChangeRequestById(validated.value.changeRequestId)
    if (isFailureResult(existing)) {
      if (isNotFoundResult(existing)) {
        return res.status(404).json({ ok: false, message: CHANGE_REQUEST_NOT_FOUND_MESSAGE })
      }
      logEvent('error', 'operations_change_request_decision.lookup_failed', {
        requestId,
        changeRequestId: validated.value.changeRequestId,
        reason: readFailureError(existing),
      })
      return res.status(500).json({ ok: false, message: DECISION_UNAVAILABLE_MESSAGE })
    }

    const applied = await applyOperationsChangeRequestDecision(
      validated.value.changeRequestId,
      validated.value.decision,
    )

    if (isReasonedFailureResult(applied)) {
      if (applied.reason === 'not_found') {
        return res.status(404).json({ ok: false, message: CHANGE_REQUEST_NOT_FOUND_MESSAGE })
      }
      if (applied.reason === 'invalid_state') {
        return res.status(409).json({ ok: false, message: readReasonedFailureMessage(applied) })
      }

      logEvent('error', 'operations_change_request_decision.apply_failed', {
        requestId,
        changeRequestId: validated.value.changeRequestId,
        decision: validated.value.decision,
        reason: readReasonedFailureMessage(applied).slice(0, 300),
      })
      return res.status(500).json({ ok: false, message: DECISION_UNAVAILABLE_MESSAGE })
    }

    let review = null
    const businessOrder = await getBusinessOrderIdByOrderUuid(existing.row.order_id)
    if (businessOrder.ok) {
      const built = await buildOperationsOrderReviewByOrderId(businessOrder.businessOrderId)
      if (built.ok) review = built.review
    }

    const publicOrderNumber = await getPublicOrderNumberByOrderUuid(existing.row.order_id)
    await createChangeRequestDecisionNotificationBestEffort({
      requestId,
      userId: existing.row.user_id,
      orderUuid: existing.row.order_id,
      publicOrderNumber,
      decision: validated.value.decision,
    })

    logEvent('info', 'operations_change_request_decision.applied', {
      requestId,
      changeRequestId: validated.value.changeRequestId,
      decision: validated.value.decision,
      status: applied.changeRequest.status,
    })

    return res.status(200).json({
      ok: true,
      changeRequest: applied.changeRequest,
      review,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logEvent('error', 'operations_change_request_decision.apply_failed', {
      requestId,
      changeRequestId: validated.value.changeRequestId,
      reason: message.slice(0, 300),
    })
    return res.status(500).json({ ok: false, message: DECISION_UNAVAILABLE_MESSAGE })
  }
}
