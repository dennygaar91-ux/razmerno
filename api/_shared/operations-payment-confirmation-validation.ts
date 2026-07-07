export const OPERATIONS_PAYMENT_CONFIRMATION_NOTE_MAX_LENGTH = 500

const ORDER_ID_PATTERN = /^RZ-\d{8}-\d{4}$/

export type OperationsPaymentConfirmationInput = {
  orderId: string
  note: string | null
}

export type OperationsPaymentConfirmationValidationResult =
  | { ok: true; value: OperationsPaymentConfirmationInput }
  | { ok: false; message: string }

export function isValidOperationsPaymentConfirmationOrderId(value: string): boolean {
  return ORDER_ID_PATTERN.test(value)
}

export function validateOperationsPaymentConfirmationBody(
  body: unknown,
): OperationsPaymentConfirmationValidationResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'Некорректные данные запроса.' }
  }

  const record = body as Record<string, unknown>
  const forbiddenKeys = [
    'priceBreakdown',
    'productionExport',
    'status',
    'domainStatus',
    'totalPrice',
    'customerName',
    'paymentProvider',
    'cardNumber',
  ]
  for (const key of forbiddenKeys) {
    if (key in record) {
      return { ok: false, message: 'Недопустимые поля в запросе.' }
    }
  }

  if (
    typeof record.orderId !== 'string' ||
    !isValidOperationsPaymentConfirmationOrderId(record.orderId.trim())
  ) {
    return { ok: false, message: 'Некорректный идентификатор заказа.' }
  }

  let note: string | null = null
  if (record.note !== undefined && record.note !== null) {
    if (typeof record.note !== 'string') {
      return { ok: false, message: 'Примечание должно быть текстом.' }
    }
    const trimmed = record.note.trim()
    if (trimmed.length > OPERATIONS_PAYMENT_CONFIRMATION_NOTE_MAX_LENGTH) {
      return { ok: false, message: 'Примечание слишком длинное.' }
    }
    note = trimmed.length > 0 ? trimmed : null
  }

  return {
    ok: true,
    value: {
      orderId: record.orderId.trim(),
      note,
    },
  }
}
