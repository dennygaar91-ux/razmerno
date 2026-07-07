import type { AdminOrderSummary } from './admin-orders'
import { INITIAL_ORDER_DOMAIN_STATUS } from './order-domain'
import type { OperationsDecisionAudit, OperationsDecisionHistoryEntry } from './operations-order-decision-types'
import { deriveLatestOperationsDecisionAudit } from './operations-order-decision-history'

import type { OperationsManualPricingDraft } from './operations-manual-pricing-draft-types'
import type { OperationsChangeRequest } from './operations-change-request-types'
import {
  derivePaymentReadinessState,
  isManualPaymentConfirmationAllowedForDomainStatus,
  type PaymentReadinessState,
} from './payment-readiness-domain'

export type OperationsOrderReview = {
  orderId: string
  status: string
  domainStatus: string
  reviewDecisionAllowed: boolean
  createdAt: string | null
  updatedAt: string | null
  customerNameMasked: string
  phoneMasked: string
  emailMasked: string
  productSummary: string
  productType: string
  dimensionsSummary: string
  materialsSummary: string
  totalPrice: number
  totalPriceLabel: string
  pricingLabel: string
  pricingSource: string
  pricingSnapshotSummary: string
  priceBreakdownSummary: string
  deliverySummary: string
  assemblySummary: string
  assemblyBasePriceSummary: string
  managerEmailStatus: string
  customerEmailStatus: string
  productionReviewStatus: string
  basisStatus: string
  validationErrorsCount: number
  validationWarningsCount: number
  approvalActionsImplemented: boolean
  manualPricingDraft: OperationsManualPricingDraft | null
  latestDecisionAudit: OperationsDecisionAudit | null
  decisionHistory: OperationsDecisionHistoryEntry[]
  changeRequests: OperationsChangeRequest[]
  paymentState: PaymentReadinessState
  paymentConfirmationAllowed: boolean
}

export const OPERATIONS_ORDER_REVIEW_FORBIDDEN_RESPONSE_KEYS = [
  'customer_name',
  'customer_phone',
  'customer_email',
  'delivery_address',
  'price_breakdown',
  'production_export',
  'dimensions',
  'user_id',
  'catalog_source_used',
  'pricing_source_diagnostic',
  'pricing_fallback_reason',
] as const

const DIMENSIONS_PATTERN = /(\d+)\s*[\u00D7x]\s*(\d+)\s*[\u00D7x]\s*(\d+)/u
const MATERIALS_NOT_AVAILABLE = 'not available in current admin payload'
const PRICING_SNAPSHOT_NOT_AVAILABLE = 'pricing snapshot details not available'
const BASIS_NOT_VERIFIED = 'not verified'
const BASIS_MANUAL_REVIEW = 'manual review required'

function formatRubles(value: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`
}

function parseProductType(product: string): string {
  if (product.startsWith('Комод')) return 'Комод'
  if (product.startsWith('Тумба')) return 'Тумба'
  if (product.startsWith('Шкаф')) return 'Шкаф'
  return product.split(' ')[0] ?? 'Изделие'
}

function parseDimensionsSummary(order: AdminOrderSummary): string {
  const match = order.product.match(DIMENSIONS_PATTERN)
  if (match) return `${match[1]}×${match[2]}×${match[3]} мм`
  return 'не указано'
}

function buildPriceBreakdownSummary(order: AdminOrderSummary): string {
  const keys = Object.keys(order.priceBreakdown ?? {})
  if (keys.length === 0) return 'stored breakdown not available in current admin payload'
  return `stored breakdown keys: ${keys.join(', ')}`
}

function buildPricingSnapshotSummary(order: AdminOrderSummary): string {
  const parts = [
    'persisted total/delivery/assembly from stored order snapshot',
    order.pricing.diagnostic ? `diagnostic: ${order.pricing.diagnostic}` : null,
    order.pricing.fallbackReason ? `fallback: ${order.pricing.fallbackReason}` : null,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join('; ') : PRICING_SNAPSHOT_NOT_AVAILABLE
}

function summarizeProductionReview(productionExport: unknown): {
  productionReviewStatus: string
  basisStatus: string
  validationErrorsCount: number
  validationWarningsCount: number
} {
  if (!productionExport || typeof productionExport !== 'object') {
    return {
      productionReviewStatus: '—',
      basisStatus: BASIS_NOT_VERIFIED,
      validationErrorsCount: 0,
      validationWarningsCount: 0,
    }
  }

  const pack = productionExport as {
    review?: { status?: string }
    validation?: { errors?: unknown[]; warnings?: unknown[] }
    rules?: { autoRejects?: unknown[]; autoWarnings?: unknown[] }
  }

  const validationErrors = pack.validation?.errors?.length ?? 0
  const validationWarnings = pack.validation?.warnings?.length ?? 0
  const autoRejects = pack.rules?.autoRejects?.length ?? 0
  const autoWarnings = pack.rules?.autoWarnings?.length ?? 0

  return {
    productionReviewStatus: pack.review?.status ?? 'requires-review',
    basisStatus: BASIS_MANUAL_REVIEW,
    validationErrorsCount: validationErrors + autoRejects,
    validationWarningsCount: validationWarnings + autoWarnings,
  }
}

export function buildOperationsOrderReview(
  order: AdminOrderSummary,
  productionExport: unknown | null,
  decisionHistory: OperationsDecisionHistoryEntry[] = [],
  changeRequests: OperationsChangeRequest[] = [],
): OperationsOrderReview {
  const production = summarizeProductionReview(productionExport)
  const latestDecisionAudit = deriveLatestOperationsDecisionAudit(decisionHistory)

  return {
    orderId: order.id,
    status: order.status,
    domainStatus: order.domainStatus,
    reviewDecisionAllowed: order.domainStatus === INITIAL_ORDER_DOMAIN_STATUS,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customerNameMasked: order.customer.nameMasked,
    phoneMasked: order.customer.phoneMasked,
    emailMasked: order.customer.emailMasked,
    productSummary: order.product,
    productType: parseProductType(order.product),
    dimensionsSummary: parseDimensionsSummary(order),
    materialsSummary: MATERIALS_NOT_AVAILABLE,
    totalPrice: order.totalPrice,
    totalPriceLabel: formatRubles(order.totalPrice),
    pricingLabel: order.pricing.status,
    pricingSource: order.pricing.source,
    pricingSnapshotSummary: buildPricingSnapshotSummary(order),
    priceBreakdownSummary: buildPriceBreakdownSummary(order),
    deliverySummary: order.delivery.enabled
      ? `${formatRubles(order.delivery.price)} · ${order.delivery.addressMasked ?? 'адрес скрыт'}`
      : 'нет',
    assemblySummary: order.assembly.enabled ? formatRubles(order.assembly.price) : 'нет',
    assemblyBasePriceSummary:
      order.assembly.basePrice === null ? 'not available in current admin payload' : formatRubles(order.assembly.basePrice),
    managerEmailStatus: order.email.manager,
    customerEmailStatus: order.email.customer,
    ...production,
    approvalActionsImplemented: true,
    manualPricingDraft: null,
    latestDecisionAudit,
    decisionHistory,
    changeRequests,
    paymentState: derivePaymentReadinessState(order.domainStatus),
    paymentConfirmationAllowed: isManualPaymentConfirmationAllowedForDomainStatus(order.domainStatus),
  }
}
