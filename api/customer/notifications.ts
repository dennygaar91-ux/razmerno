import { authorizeCustomerApi, prepareCustomerApi } from '../_shared/customer-api-auth'
import { listCustomerNotificationsForUser } from '../_shared/customer-notifications-store'
import { logEvent } from '../_shared/logger'
import type { ServerlessRequest, ServerlessResponse } from '../_shared/serverless-types'

const NOTIFICATIONS_UNAVAILABLE_MESSAGE = 'Уведомления временно недоступны. Попробуйте позже.'

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const prepared = prepareCustomerApi(req, res, ['GET'])
  if (!prepared) return

  const auth = await authorizeCustomerApi(req, res, prepared.requestId)
  if (!auth) return

  const listed = await listCustomerNotificationsForUser(auth.user.userId)
  if (!listed.ok) {
    logEvent('error', 'customer_notifications.list_failed', {
      requestId: prepared.requestId,
      userId: auth.user.userId,
      reason: listed.error,
    })
    return res.status(500).json({ ok: false, message: NOTIFICATIONS_UNAVAILABLE_MESSAGE })
  }

  return res.status(200).json({ ok: true, notifications: listed.notifications })
}
