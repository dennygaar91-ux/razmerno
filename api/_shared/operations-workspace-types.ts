import type { AdminOrderSummary } from './admin-orders'

export type OperationsWorkspaceOrder = {
  orderId: string
  status: string
  domainStatus: string
  createdAt: string | null
  updatedAt: string | null
  customerNameMasked: string
  productSummary: string
  totalPrice: number
  productionStatus: string
}

export type OperationsWorkspaceStats = {
  total: number
}

export type OperationsWorkspace = {
  orders: OperationsWorkspaceOrder[]
  stats: OperationsWorkspaceStats
}

export const OPERATIONS_WORKSPACE_FORBIDDEN_RESPONSE_KEYS = [
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

export function mapOperationsWorkspaceOrder(summary: AdminOrderSummary): OperationsWorkspaceOrder {
  return {
    orderId: summary.id,
    status: summary.status,
    domainStatus: summary.domainStatus,
    createdAt: summary.createdAt,
    updatedAt: summary.updatedAt,
    customerNameMasked: summary.customer.nameMasked,
    productSummary: summary.product,
    totalPrice: summary.totalPrice,
    productionStatus: summary.production.status,
  }
}

export function buildOperationsWorkspace(orders: AdminOrderSummary[]): OperationsWorkspace {
  const workspaceOrders = orders.map(mapOperationsWorkspaceOrder)
  return {
    orders: workspaceOrders,
    stats: { total: workspaceOrders.length },
  }
}
