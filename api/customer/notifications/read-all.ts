import { authorizeCustomerApi, prepareCustomerApi } from '../../_shared/customer-api-auth'
import { markAllCustomerNotificationsReadForUser } from '../../_shared/customer-notifications-store'
import { logEvent } from '../../_shared/logger'
import type { ServerlessRequest, ServerlessResponse } from '../../_shared/serverless-types'

const NOTIFICATIONS_UNAVAILABLE_MESSAGE = 'Уведомления временно недоступны. Попробуйте позже.'

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const prepared = prepareCustomerApi(req, res, ['PATCH'])
  if (!prepared) return

  const auth = await authorizeCustomerApi(req, res, prepared.requestId)
  if (!auth) return

  const marked = await markAllCustomerNotificationsReadForUser(auth.user.userId)
  if (!marked.ok) {
    logEvent('error', 'customer_notifications.mark_all_read_failed', {
      requestId: prepared.requestId,
      userId: auth.user.userId,
      reason: marked.error,
    })
    return res.status(500).json({ ok: false, message: NOTIFICATIONS_UNAVAILABLE_MESSAGE })
  }

  return res.status(200).json({ ok: true, updatedCount: marked.updatedCount })
}
