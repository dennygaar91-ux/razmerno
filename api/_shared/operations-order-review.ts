import { getAdminOrderByOrderId, getAdminProductionDetail } from './admin-orders'
import { listOperationsChangeRequestsByOrderUuid } from './customer-change-requests-store'
import { getOrderUuidByBusinessOrderIdForService } from './customer-orders-store'
import { listOperationsOrderStatusHistoryByOrderId } from './operations-order-decision-store'
import { getOperationsManualPricingDraftByOrderId } from './operations-manual-pricing-drafts-store'
import type { OperationsChangeRequest } from './operations-change-request-types'
import { buildOperationsOrderReview } from './operations-order-review-types'
import { isFailureResult, isNotFoundResult, readFailureError } from './result-utils'

export async function buildOperationsOrderReviewByOrderId(orderId: string): Promise<
  | { ok: true; review: ReturnType<typeof buildOperationsOrderReview> }
  | { ok: false; reason: 'not_found' | 'error'; message: string }
> {
  try {
    const order = await getAdminOrderByOrderId(orderId)
    if (!order) return { ok: false, reason: 'not_found', message: 'Order not found' }

    const detail = await getAdminProductionDetail(orderId)
    const draftResult = await getOperationsManualPricingDraftByOrderId(orderId)
    if (isFailureResult(draftResult)) {
      return { ok: false, reason: 'error', message: readFailureError(draftResult) }
    }

    const decisionHistory = await listOperationsOrderStatusHistoryByOrderId(orderId)
    let changeRequests: OperationsChangeRequest[] = []

    const orderUuid = await getOrderUuidByBusinessOrderIdForService(orderId)
    if (orderUuid.ok) {
      const listed = await listOperationsChangeRequestsByOrderUuid(orderUuid.orderUuid)
      if (isFailureResult(listed)) {
        return { ok: false, reason: 'error', message: readFailureError(listed) }
      }
      changeRequests = listed.changeRequests
    } else if (isFailureResult(orderUuid)) {
      if (!isNotFoundResult(orderUuid)) {
        return { ok: false, reason: 'error', message: readFailureError(orderUuid) }
      }
    }

    const review = buildOperationsOrderReview(order, detail.productionExport, decisionHistory, changeRequests)
    return { ok: true, review: { ...review, manualPricingDraft: draftResult.draft } }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, reason: 'error', message }
  }
}
