import { isValidProjectId } from './constructor-project-types'
import {
  isCustomerChangeRequestType,
  type CustomerChangeRequestCreateInput,
  type CustomerChangeRequestType,
} from './customer-change-request-types'

export const CUSTOMER_CHANGE_REQUEST_MESSAGE_MAX_LENGTH = 2000

export type CustomerChangeRequestValidationResult =
  | { ok: true; value: CustomerChangeRequestCreateInput }
  | { ok: false; message: string }

export function isValidCustomerChangeRequestOrderId(value: string): boolean {
  return isValidProjectId(value)
}

export function validateCustomerChangeRequestBody(
  body: unknown,
): CustomerChangeRequestValidationResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'Некорректные данные запроса.' }
  }

  const record = body as Record<string, unknown>

  if (typeof record.orderId !== 'string' || !isValidCustomerChangeRequestOrderId(record.orderId)) {
    return { ok: false, message: 'Некорректный идентификатор заказа.' }
  }

  if (typeof record.requestType !== 'string' || !isCustomerChangeRequestType(record.requestType)) {
    return { ok: false, message: 'Некорректный тип запроса на изменение.' }
  }

  if (typeof record.message !== 'string') {
    return { ok: false, message: 'Сообщение должно быть текстом.' }
  }

  const message = record.message.trim()
  if (!message) {
    return { ok: false, message: 'Сообщение не может быть пустым.' }
  }

  if (message.length > CUSTOMER_CHANGE_REQUEST_MESSAGE_MAX_LENGTH) {
    return { ok: false, message: 'Сообщение слишком длинное.' }
  }

  return {
    ok: true,
    value: {
      orderId: record.orderId.trim(),
      requestType: record.requestType as CustomerChangeRequestType,
      message,
    },
  }
}
