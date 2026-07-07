export const OPERATIONS_ORDER_COMPLETION_NOTE_MAX_LENGTH = 500

const ORDER_ID_PATTERN = /^RZ-\d{8}-\d{4}$/

export type OperationsOrderCompletionInput = {
  orderId: string
  note: string | null
}

export type OperationsOrderCompletionValidationResult =
  | { ok: true; value: OperationsOrderCompletionInput }
  | { ok: false; message: string }

export function isValidOperationsOrderCompletionOrderId(value: string): boolean {
  return ORDER_ID_PATTERN.test(value)
}

export function validateOperationsOrderCompletionBody(
  body: unknown,
): OperationsOrderCompletionValidationResult {
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
    !isValidOperationsOrderCompletionOrderId(record.orderId.trim())
  ) {
    return { ok: false, message: 'Некорректный идентификатор заказа.' }
  }

  let note: string | null = null
  if (record.note !== undefined && record.note !== null) {
    if (typeof record.note !== 'string') {
      return { ok: false, message: 'Примечание должно быть строкой.' }
    }
    const trimmed = record.note.trim()
    if (trimmed.length > OPERATIONS_ORDER_COMPLETION_NOTE_MAX_LENGTH) {
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
