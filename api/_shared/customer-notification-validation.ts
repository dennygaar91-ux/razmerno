import { isValidProjectId } from './constructor-project-types'

export type CustomerNotificationReadBody = {
  notificationId: string
}

export type CustomerNotificationReadValidationResult =
  | { ok: true; value: CustomerNotificationReadBody }
  | { ok: false; message: string }

export function validateCustomerNotificationReadBody(
  body: unknown,
): CustomerNotificationReadValidationResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'Некорректные данные запроса.' }
  }

  const record = body as Record<string, unknown>

  if (typeof record.notificationId !== 'string' || !isValidProjectId(record.notificationId)) {
    return { ok: false, message: 'Некорректный идентификатор уведомления.' }
  }

  return {
    ok: true,
    value: {
      notificationId: record.notificationId.trim(),
    },
  }
}
