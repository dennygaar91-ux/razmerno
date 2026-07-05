import { getAdminOrderByOrderId, getAdminProductionDetail } from './admin-orders'
import { buildOperationsOrderReview } from './operations-order-review-types'

export async function buildOperationsOrderReviewByOrderId(orderId: string): Promise<
  | { ok: true; review: ReturnType<typeof buildOperationsOrderReview> }
  | { ok: false; reason: 'not_found' | 'error'; message: string }
> {
  try {
    const order = await getAdminOrderByOrderId(orderId)
    if (!order) return { ok: false, reason: 'not_found', message: 'Order not found' }

    const detail = await getAdminProductionDetail(orderId)
    return { ok: true, review: buildOperationsOrderReview(order, detail.productionExport) }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, reason: 'error', message }
  }
}
