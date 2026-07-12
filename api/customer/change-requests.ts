import { authorizeCustomerApi, prepareCustomerApi, readQueryString } from '../_shared/customer-api-auth'
import { isValidCustomerChangeRequestOrderId } from '../_shared/customer-change-request-validation'
import { listCustomerChangeRequestsForOrder } from '../_shared/customer-change-requests-store'
import { getCustomerOrderByIdForUser } from '../_shared/customer-orders-store'
import { logEvent } from '../_shared/logger'
import { isFailureResult, isNotFoundResult, readFailureError } from '../_shared/result-utils'
import type { ServerlessRequest, ServerlessResponse } from '../_shared/serverless-types'

const ORDER_NOT_FOUND_MESSAGE = 'Заказ не найден.'
const CHANGE_REQUEST_UNAVAILABLE_MESSAGE = 'Запрос временно недоступен. Попробуйте позже.'
const INVALID_ORDER_ID_MESSAGE = 'Некорректный идентификатор заказа.'

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const prepared = prepareCustomerApi(req, res, ['GET'])
  if (!prepared) return

  const orderId = readQueryString(req.query?.orderId)
  if (!isValidCustomerChangeRequestOrderId(orderId)) {
    return res.status(400).json({ ok: false, message: INVALID_ORDER_ID_MESSAGE })
  }

  const auth = await authorizeCustomerApi(req, res, prepared.requestId)
  if (!auth) return

  const owned = await getCustomerOrderByIdForUser(orderId, auth.user.userId)
  if (isFailureResult(owned)) {
    if (isNotFoundResult(owned)) {
      return res.status(404).json({ ok: false, message: ORDER_NOT_FOUND_MESSAGE })
    }

    logEvent('error', 'customer_change_requests.order_lookup_failed', {
      requestId: prepared.requestId,
      orderId,
      userId: auth.user.userId,
      reason: readFailureError(owned),
    })
    return res.status(500).json({ ok: false, message: CHANGE_REQUEST_UNAVAILABLE_MESSAGE })
  }

  const listed = await listCustomerChangeRequestsForOrder(orderId, auth.user.userId)
  if (isFailureResult(listed)) {
    logEvent('error', 'customer_change_requests.list_failed', {
      requestId: prepared.requestId,
      orderId,
      userId: auth.user.userId,
      reason: readFailureError(listed),
    })
    return res.status(500).json({ ok: false, message: CHANGE_REQUEST_UNAVAILABLE_MESSAGE })
  }

  return res.status(200).json({ ok: true, changeRequests: listed.changeRequests })
}
