import { getAdminOrderByOrderId, getAdminProductionDetail } from './admin-orders'
import { getLatestOperationsDecisionAuditByOrderId } from './operations-order-decision-store'
import { getOperationsManualPricingDraftByOrderId } from './operations-manual-pricing-drafts-store'
import { buildOperationsOrderReview } from './operations-order-review-types'

export async function buildOperationsOrderReviewByOrderId(orderId: string): Promise<
  | { ok: true; review: ReturnType<typeof buildOperationsOrderReview> }
  | { ok: false; reason: 'not_found' | 'error'; message: string }
> {
  try {
    const order = await getAdminOrderByOrderId(orderId)
    if (!order) return { ok: false, reason: 'not_found', message: 'Order not found' }

    const detail = await getAdminProductionDetail(orderId)
    const draftResult = await getOperationsManualPricingDraftByOrderId(orderId)
    if (!draftResult.ok) {
      return { ok: false, reason: 'error', message: draftResult.error }
    }

    const latestDecisionAudit = await getLatestOperationsDecisionAuditByOrderId(orderId)
    const review = buildOperationsOrderReview(order, detail.productionExport, latestDecisionAudit)
    return { ok: true, review: { ...review, manualPricingDraft: draftResult.draft } }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, reason: 'error', message }
  }
}
