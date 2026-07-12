import { validateAdminRequest } from '../_shared/admin-auth'
import { createManualPaymentConfirmationNotificationBestEffort } from '../_shared/customer-notification-events'
import { applyJsonHeaders } from '../_shared/headers'
import { logEvent } from '../_shared/logger'
import { applyOperationsManualPaymentConfirmation } from '../_shared/operations-payment-confirmation-store'
import { validateOperationsPaymentConfirmationBody } from '../_shared/operations-payment-confirmation-validation'
import { buildOperationsOrderReviewByOrderId } from '../_shared/operations-order-review'
import { applyRequestIdHeader, getRequestId } from '../_shared/request-context'
import {
  isFailureResult,
  isReasonedFailureResult,
  readFailureMessage,
  readReasonedFailureMessage,
} from '../_shared/result-utils'
import type { ServerlessRequest, ServerlessResponse } from '../_shared/serverless-types'

const CONFIRMATION_UNAVAILABLE_MESSAGE = 'Operations payment confirmation is temporarily unavailable.'
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

  const validated = validateOperationsPaymentConfirmationBody(parseBody(req.body))
  if (isFailureResult(validated)) {
    return res.status(400).json({ ok: false, message: readFailureMessage(validated) })
  }

  try {
    const applied = await applyOperationsManualPaymentConfirmation(validated.value, 'operations')
    if (isReasonedFailureResult(applied)) {
      if (applied.reason === 'not_found') {
        return res.status(404).json({ ok: false, message: ORDER_NOT_FOUND_MESSAGE })
      }
      if (applied.reason === 'invalid_state') {
        return res.status(409).json({ ok: false, message: readReasonedFailureMessage(applied) })
      }
      logEvent('error', 'operations_payment_confirmation.apply_failed', {
        requestId,
        orderId: validated.value.orderId,
        reason: readReasonedFailureMessage(applied).slice(0, 300),
      })
      return res.status(500).json({ ok: false, message: CONFIRMATION_UNAVAILABLE_MESSAGE })
    }

    const built = await buildOperationsOrderReviewByOrderId(validated.value.orderId)
    if (isReasonedFailureResult(built)) {
      logEvent('error', 'operations_payment_confirmation.review_reload_failed', {
        requestId,
        orderId: validated.value.orderId,
        reason: readReasonedFailureMessage(built).slice(0, 300),
      })
      return res.status(200).json({
        ok: true,
        confirmation: applied.result,
        review: null,
        message: 'Payment confirmed, but review reload is temporarily unavailable.',
      })
    }

    logEvent('info', 'operations_payment_confirmation.applied', {
      requestId,
      orderId: validated.value.orderId,
      domainStatus: applied.result.domainStatus,
    })

    await createManualPaymentConfirmationNotificationBestEffort({
      requestId,
      businessOrderId: validated.value.orderId,
    })

    return res.status(200).json({
      ok: true,
      confirmation: applied.result,
      review: built.review,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logEvent('error', 'operations_payment_confirmation.apply_failed', {
      requestId,
      orderId: validated.value.orderId,
      reason: message.slice(0, 300),
    })
    return res.status(500).json({ ok: false, message: CONFIRMATION_UNAVAILABLE_MESSAGE })
  }
}
