import { isValidProjectId } from './constructor-project-types'
import { isCustomerChangeRequestAllowedForDomainStatus } from './customer-change-request-policy'
import { mapCustomerOrderStatus, type CustomerOrderStatus } from './customer-order-status'
import {
  derivePaymentReadinessState,
  type PaymentReadinessState,
} from './payment-readiness-domain'
import {
  deriveFurnitureTotalFromStoredSnapshot,
  readStoredOrderPricingSnapshot,
} from './stored-order-pricing-snapshot'

export type CustomerOrderDetailRow = {
  id: string
  user_id: string | null
  public_order_number: string | null
  domain_status: string | null
  created_at: string
  total_price: number
  customer_name: string
  customer_phone: string | null
  delivery_address: string | null
  delivery_enabled: boolean
  delivery_price: number | null
  assembly_enabled: boolean
  assembly_price: number | null
  product_type: string | null
  dimensions: { width?: number; height?: number; depth?: number } | null
  materials: { bodyId?: string; facadeId?: string } | null
  style: { facadeStyleId?: string; hardwareId?: string } | null
  sections: number | null
  filling: { shelves?: number; drawers?: number; hangingRod?: boolean } | null
  price_breakdown: Record<string, number> | null
}

export type CustomerOrderPricingSummary = {
  furnitureTotal: number
  deliveryTotal: number | null
  assemblyTotal: number | null
}

export type CustomerOrderDetail = {
  id: string
  publicOrderNumber: string | null
  status: CustomerOrderStatus
  createdAt: string
  totalPrice: number
  customerName: string
  customerPhone: string | null
  deliveryAddress: string | null
  deliveryEnabled: boolean
  assemblyEnabled: boolean
  dimensionsSummary: string | null
  materialsDecorSummary: string | null
  pricingSummary: CustomerOrderPricingSummary
  changeRequestAllowed: boolean
  paymentState: PaymentReadinessState
}

export function isValidCustomerOrderId(value: string): boolean {
  return isValidProjectId(value)
}

function formatProductTypeLabel(productType: string | null): string {
  if (productType === 'dresser') return 'Комод'
  if (productType === 'nightstand') return 'Тумба'
  return 'Шкаф'
}

function humanizeToken(value: string): string {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .slice(-2)
    .join(' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function formatCustomerOrderDimensionsSummary(
  dimensions: CustomerOrderDetailRow['dimensions'],
): string | null {
  if (!dimensions) return null
  const { width, height, depth } = dimensions
  if (!width || !height || !depth) return null
  return `${width} × ${height} × ${depth} мм`
}

export function formatCustomerOrderMaterialsDecorSummary(
  materials: CustomerOrderDetailRow['materials'],
  style: CustomerOrderDetailRow['style'],
): string | null {
  const parts: string[] = []

  if (materials?.bodyId) {
    parts.push(`Корпус: ${humanizeToken(materials.bodyId)}`)
  }
  if (materials?.facadeId && materials.facadeId !== materials.bodyId) {
    parts.push(`Фасад: ${humanizeToken(materials.facadeId)}`)
  }
  if (style?.facadeStyleId) {
    parts.push(`Фасады: ${humanizeToken(style.facadeStyleId)}`)
  }
  if (style?.hardwareId) {
    parts.push(`Фурнитура: ${humanizeToken(style.hardwareId)}`)
  }

  return parts.length > 0 ? parts.join(' · ') : null
}

export function buildCustomerOrderPricingSummary(row: CustomerOrderDetailRow): CustomerOrderPricingSummary {
  const snapshot = readStoredOrderPricingSnapshot(row)

  return {
    furnitureTotal: deriveFurnitureTotalFromStoredSnapshot(snapshot),
    deliveryTotal: snapshot.deliveryPrice,
    assemblyTotal: snapshot.assemblyPrice,
  }
}

export function mapCustomerOrderDetail(row: CustomerOrderDetailRow): CustomerOrderDetail {
  return {
    id: row.id,
    publicOrderNumber: row.public_order_number,
    status: mapCustomerOrderStatus(row.domain_status),
    createdAt: row.created_at,
    totalPrice: row.total_price,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    deliveryAddress: row.delivery_enabled ? row.delivery_address : null,
    deliveryEnabled: row.delivery_enabled,
    assemblyEnabled: row.assembly_enabled,
    dimensionsSummary: formatCustomerOrderDimensionsSummary(row.dimensions),
    materialsDecorSummary: formatCustomerOrderMaterialsDecorSummary(row.materials, row.style),
    pricingSummary: buildCustomerOrderPricingSummary(row),
    changeRequestAllowed: isCustomerChangeRequestAllowedForDomainStatus(row.domain_status),
    paymentState: derivePaymentReadinessState(row.domain_status),
  }
}

export function getCustomerOrderFurnitureLabel(productType: string | null): string {
  return formatProductTypeLabel(productType)
}

export const CUSTOMER_ORDER_DETAIL_FORBIDDEN_RESPONSE_KEYS = [
  'order_id',
  'orderId',
  'domain_status',
  'domainStatus',
  'production_export',
  'productionExport',
  'price_breakdown',
  'priceBreakdown',
  'pricing_source_diagnostic',
  'pricingSourceDiagnostic',
  'pricing_fallback_reason',
  'pricingFallbackReason',
  'catalog_source_used',
  'catalogSourceUsed',
  'customer_email',
  'customerEmail',
  'manager_email_status',
  'customer_email_status',
  'audit',
  'auditEvents',
] as const
