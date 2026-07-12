export const OPERATIONS_MANUAL_PRICING_DRAFT_STATUS = 'draft' as const

export type OperationsManualPricingDraftStatus = typeof OPERATIONS_MANUAL_PRICING_DRAFT_STATUS

export type OperationsManualPricingDraftRow = {
  id: string
  order_id: string
  manual_total_price: number
  reason: string | null
  status: OperationsManualPricingDraftStatus
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

export type OperationsManualPricingDraft = {
  orderId: string
  manualTotalPrice: number
  manualTotalPriceLabel: string
  reason: string | null
  status: OperationsManualPricingDraftStatus
  updatedAt: string | null
}

export type OperationsManualPricingDraftSaveInput = {
  orderId: string
  manualTotalPrice: number
  reason: string | null
}

export const OPERATIONS_MANUAL_PRICING_DRAFT_FORBIDDEN_RESPONSE_KEYS = [
  'customer_name',
  'customer_phone',
  'customer_email',
  'delivery_address',
  'price_breakdown',
  'production_export',
  'user_id',
] as const

function formatRubles(value: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`
}

export function mapOperationsManualPricingDraft(row: OperationsManualPricingDraftRow): OperationsManualPricingDraft {
  return {
    orderId: row.order_id,
    manualTotalPrice: row.manual_total_price,
    manualTotalPriceLabel: formatRubles(row.manual_total_price),
    reason: row.reason,
    status: row.status,
    updatedAt: row.updated_at,
  }
}
