import {
  authorizeCustomerApi,
  parseCustomerApiBody,
  prepareCustomerApi,
} from '../../_shared/customer-api-auth'
import { validateCustomerNotificationReadBody } from '../../_shared/customer-notification-validation'
import { markCustomerNotificationReadForUser } from '../../_shared/customer-notifications-store'
import { logEvent } from '../../_shared/logger'
import type { ServerlessRequest, ServerlessResponse } from '../../_shared/serverless-types'

const NOTIFICATION_NOT_FOUND_MESSAGE = 'Уведомление не найдено.'
const NOTIFICATIONS_UNAVAILABLE_MESSAGE = 'Уведомления временно недоступны. Попробуйте позже.'

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  const prepared = prepareCustomerApi(req, res, ['PATCH'])
  if (!prepared) return

  const auth = await authorizeCustomerApi(req, res, prepared.requestId)
  if (!auth) return

  const validated = validateCustomerNotificationReadBody(parseCustomerApiBody(req.body))
  if (!validated.ok) {
    return res.status(400).json({ ok: false, message: validated.message })
  }

  const marked = await markCustomerNotificationReadForUser(
    validated.value.notificationId,
    auth.user.userId,
  )

  if (!marked.ok) {
    if ('notFound' in marked && marked.notFound) {
      return res.status(404).json({ ok: false, message: NOTIFICATION_NOT_FOUND_MESSAGE })
    }

    logEvent('error', 'customer_notifications.mark_read_failed', {
      requestId: prepared.requestId,
      userId: auth.user.userId,
      notificationId: validated.value.notificationId,
      reason: marked.error,
    })
    return res.status(500).json({ ok: false, message: NOTIFICATIONS_UNAVAILABLE_MESSAGE })
  }

  return res.status(200).json({ ok: true, notification: marked.notification })
}
