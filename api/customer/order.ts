import { authorizeCustomerApi, prepareCustomerApi, readQueryString } from '../_shared/customer-api-auth'
import { getCustomerOrderByIdForUser } from '../_shared/customer-orders-store'
import {
  isValidCustomerOrderId,
  mapCustomerOrderDetail,
} from '../_shared/customer-order-detail-types'
import { logEvent } from '../_shared/logger'
import { isFailureResult, isNotFoundResult, readFailureError } from '../_shared/result-utils'
import type { ServerlessRequest, ServerlessResponse } from '../_shared/serverless-types'

const ORDER_NOT_FOUND_MESSAGE = 'Заказ не найден.'
const ORDER_UNAVAILABLE_MESSAGE = 'Заказ временно недоступен. Попробуйте позже.'
const INVALID_ORDER_ID_MESSAGE = 'Некорректный идентификатор заказа.'

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const prepared = prepareCustomerApi(req, res, ['GET'])
  if (!prepared) return

  const orderId = readQueryString(req.query?.id)
  if (!isValidCustomerOrderId(orderId)) {
    return res.status(400).json({ ok: false, message: INVALID_ORDER_ID_MESSAGE })
  }

  const auth = await authorizeCustomerApi(req, res, prepared.requestId)
  if (!auth) return

  const loaded = await getCustomerOrderByIdForUser(orderId, auth.user.userId)
  if (isFailureResult(loaded)) {
    if (isNotFoundResult(loaded)) {
      return res.status(404).json({ ok: false, message: ORDER_NOT_FOUND_MESSAGE })
    }

    logEvent('error', 'customer_order.get_failed', {
      requestId: prepared.requestId,
      orderId,
      userId: auth.user.userId,
      reason: readFailureError(loaded),
    })
    return res.status(500).json({ ok: false, message: ORDER_UNAVAILABLE_MESSAGE })
  }

  return res.status(200).json({ ok: true, order: mapCustomerOrderDetail(loaded.order) })
}
