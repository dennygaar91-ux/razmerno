import type { OperationsOrderDecisionInput } from './operations-order-decision-types'

export const OPERATIONS_ORDER_DECISION_REASON_MIN_LENGTH = 3
export const OPERATIONS_ORDER_DECISION_REASON_MAX_LENGTH = 500

const ORDER_ID_PATTERN = /^RZ-\d{8}-\d{4}$/
const DECISIONS = new Set(['approve', 'reject'])

export type OperationsOrderDecisionValidationResult =
  | { ok: true; value: OperationsOrderDecisionInput }
  | { ok: false; message: string }

export function isValidOperationsOrderDecisionOrderId(value: string): boolean {
  return ORDER_ID_PATTERN.test(value)
}

export function validateOperationsOrderDecisionBody(body: unknown): OperationsOrderDecisionValidationResult {
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
  ]
  for (const key of forbiddenKeys) {
    if (key in record) {
      return { ok: false, message: 'Недопустимые поля в запросе.' }
    }
  }

  if (typeof record.orderId !== 'string' || !isValidOperationsOrderDecisionOrderId(record.orderId.trim())) {
    return { ok: false, message: 'Некорректный идентификатор заказа.' }
  }

  if (typeof record.decision !== 'string' || !DECISIONS.has(record.decision)) {
    return { ok: false, message: 'Некорректное решение. Допустимо: approve или reject.' }
  }

  const decision = record.decision as OperationsOrderDecisionInput['decision']
  let reason: string | null = null

  if (record.reason !== undefined && record.reason !== null) {
    if (typeof record.reason !== 'string') {
      return { ok: false, message: 'Причина отклонения должна быть текстом.' }
    }
    const trimmed = record.reason.trim()
    if (trimmed.length > OPERATIONS_ORDER_DECISION_REASON_MAX_LENGTH) {
      return { ok: false, message: 'Причина отклонения слишком длинная.' }
    }
    reason = trimmed.length > 0 ? trimmed : null
  }

  if (decision === 'reject') {
    if (!reason || reason.length < OPERATIONS_ORDER_DECISION_REASON_MIN_LENGTH) {
      return { ok: false, message: 'Для отклонения требуется указать причину.' }
    }
  }

  return {
    ok: true,
    value: {
      orderId: record.orderId.trim(),
      decision,
      reason,
    },
  }
}
