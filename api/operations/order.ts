import { validateAdminRequest } from '../_shared/admin-auth'
import { applyJsonHeaders } from '../_shared/headers'
import { logEvent } from '../_shared/logger'
import { buildOperationsOrderReviewByOrderId } from '../_shared/operations-order-review'
import { applyRequestIdHeader, getRequestId } from '../_shared/request-context'
import { isReasonedFailureResult, readReasonedFailureMessage } from '../_shared/result-utils'
import type { ServerlessRequest, ServerlessResponse } from '../_shared/serverless-types'

const REVIEW_UNAVAILABLE_MESSAGE = 'Operations order review is temporarily unavailable.'

function readOrderId(req: ServerlessRequest): string {
  const raw = req.query?.orderId ?? req.query?.id
  return (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? ''
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const requestId = getRequestId(req)
  applyRequestIdHeader(res, requestId)
  applyJsonHeaders(res)
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Admin-Key, Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ ok: false, message: 'Method not allowed' })

  const auth = validateAdminRequest(req)
  if (auth.ok === false) return res.status(auth.status).json({ ok: false, message: auth.message })

  const orderId = readOrderId(req)
  if (!/^RZ-\d{8}-\d{4}$/.test(orderId)) {
    return res.status(400).json({ ok: false, message: 'Invalid orderId' })
  }

  try {
    const built = await buildOperationsOrderReviewByOrderId(orderId)
    if (isReasonedFailureResult(built)) {
      if (built.reason === 'not_found') {
        return res.status(404).json({ ok: false, message: 'Order not found' })
      }
      logEvent('error', 'operations_order_review.load_failed', {
        requestId,
        orderId,
        reason: readReasonedFailureMessage(built).slice(0, 300),
      })
      return res.status(500).json({ ok: false, message: REVIEW_UNAVAILABLE_MESSAGE })
    }

    return res.status(200).json({ ok: true, review: built.review })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logEvent('error', 'operations_order_review.load_failed', { requestId, orderId, reason: message.slice(0, 300) })
    return res.status(500).json({ ok: false, message: REVIEW_UNAVAILABLE_MESSAGE })
  }
}
