import type { OperationsManualPricingDraftSaveInput } from './operations-manual-pricing-draft-types'

export const OPERATIONS_MANUAL_PRICING_REASON_MAX_LENGTH = 500
export const OPERATIONS_MANUAL_PRICING_MIN_PRICE = 1
export const OPERATIONS_MANUAL_PRICING_MAX_PRICE = 50_000_000

const ORDER_ID_PATTERN = /^RZ-\d{8}-\d{4}$/

export type OperationsManualPricingDraftValidationResult =
  | { ok: true; value: OperationsManualPricingDraftSaveInput }
  | { ok: false; message: string }

export function isValidOperationsManualPricingOrderId(value: string): boolean {
  return ORDER_ID_PATTERN.test(value)
}

export function parseManualTotalPrice(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) ? value : null
  }

  if (typeof value !== 'string') return null

  const normalized = value.replace(/\s/gu, '').replace(',', '.')
  if (!/^\d+(\.\d+)?$/u.test(normalized)) return null

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) return null

  const rounded = Math.round(parsed)
  if (Math.abs(parsed - rounded) > 0.0001) return null
  return rounded
}

export function validateOperationsManualPricingDraftBody(
  body: unknown,
): OperationsManualPricingDraftValidationResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'Некорректные данные запроса.' }
  }

  const record = body as Record<string, unknown>
  const forbiddenKeys = ['priceBreakdown', 'productionExport', 'status', 'customerName']
  for (const key of forbiddenKeys) {
    if (key in record) {
      return { ok: false, message: 'Недопустимые поля в запросе.' }
    }
  }

  if (typeof record.orderId !== 'string' || !isValidOperationsManualPricingOrderId(record.orderId.trim())) {
    return { ok: false, message: 'Некорректный идентификатор заказа.' }
  }

  const manualTotalPrice = parseManualTotalPrice(record.manualTotalPrice)
  if (manualTotalPrice === null) {
    return { ok: false, message: 'Ручная цена должна быть положительным числом.' }
  }

  if (manualTotalPrice < OPERATIONS_MANUAL_PRICING_MIN_PRICE || manualTotalPrice > OPERATIONS_MANUAL_PRICING_MAX_PRICE) {
    return { ok: false, message: 'Ручная цена вне допустимого диапазона.' }
  }

  let reason: string | null = null
  if (record.reason !== undefined && record.reason !== null) {
    if (typeof record.reason !== 'string') {
      return { ok: false, message: 'Примечание должно быть текстом.' }
    }
    const trimmed = record.reason.trim()
    if (trimmed.length > OPERATIONS_MANUAL_PRICING_REASON_MAX_LENGTH) {
      return { ok: false, message: 'Примечание слишком длинное.' }
    }
    reason = trimmed.length > 0 ? trimmed : null
  }

  return {
    ok: true,
    value: {
      orderId: record.orderId.trim(),
      manualTotalPrice,
      reason,
    },
  }
}
