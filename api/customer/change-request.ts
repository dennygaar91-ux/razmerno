import {
  authorizeCustomerApi,
  parseCustomerApiBody,
  prepareCustomerApi,
} from '../_shared/customer-api-auth'
import { validateCustomerChangeRequestBody } from '../_shared/customer-change-request-validation'
import { createCustomerChangeRequest } from '../_shared/customer-change-requests-store'
import { getCustomerOrderByIdForUser } from '../_shared/customer-orders-store'
import { logEvent } from '../_shared/logger'
import type { ServerlessRequest, ServerlessResponse } from '../_shared/serverless-types'

const ORDER_NOT_FOUND_MESSAGE = 'Заказ не найден.'
const CHANGE_REQUEST_UNAVAILABLE_MESSAGE = 'Запрос временно недоступен. Попробуйте позже.'

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const prepared = prepareCustomerApi(req, res, ['POST'])
  if (!prepared) return

  const auth = await authorizeCustomerApi(req, res, prepared.requestId)
  if (!auth) return

  const validated = validateCustomerChangeRequestBody(parseCustomerApiBody(req.body))
  if (!validated.ok) {
    return res.status(400).json({ ok: false, message: validated.message })
  }

  const owned = await getCustomerOrderByIdForUser(validated.value.orderId, auth.user.userId)
  if (!owned.ok) {
    if ('notFound' in owned && owned.notFound) {
      return res.status(404).json({ ok: false, message: ORDER_NOT_FOUND_MESSAGE })
    }

    logEvent('error', 'customer_change_request.order_lookup_failed', {
      requestId: prepared.requestId,
      orderId: validated.value.orderId,
      userId: auth.user.userId,
      reason: owned.error,
    })
    return res.status(500).json({ ok: false, message: CHANGE_REQUEST_UNAVAILABLE_MESSAGE })
  }

  const created = await createCustomerChangeRequest(auth.user.userId, validated.value)
  if (!created.ok) {
    logEvent('error', 'customer_change_request.create_failed', {
      requestId: prepared.requestId,
      orderId: validated.value.orderId,
      userId: auth.user.userId,
      reason: created.error,
    })
    return res.status(500).json({ ok: false, message: CHANGE_REQUEST_UNAVAILABLE_MESSAGE })
  }

  return res.status(200).json({ ok: true, changeRequest: created.changeRequest })
}
