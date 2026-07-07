export const CUSTOMER_CHANGE_REQUEST_TYPES = [
  'dimensions',
  'materials',
  'configuration',
  'delivery',
  'other',
] as const

export type CustomerChangeRequestType = (typeof CUSTOMER_CHANGE_REQUEST_TYPES)[number]

export const CUSTOMER_CHANGE_REQUEST_STATUS_SUBMITTED = 'submitted' as const

export const CUSTOMER_CHANGE_REQUEST_STATUSES = [
  CUSTOMER_CHANGE_REQUEST_STATUS_SUBMITTED,
  'reviewed',
  'resolved',
  'rejected',
] as const

export type CustomerChangeRequestStatus = (typeof CUSTOMER_CHANGE_REQUEST_STATUSES)[number]

export type CustomerChangeRequestRow = {
  id: string
  order_id: string
  user_id: string
  request_type: CustomerChangeRequestType
  message: string
  status: string
  created_at: string
  updated_at: string
}

export type CustomerChangeRequest = {
  id: string
  orderId: string
  requestType: CustomerChangeRequestType
  status: CustomerChangeRequestStatus
  message: string
  createdAt: string
}

export type CustomerChangeRequestCreateInput = {
  orderId: string
  requestType: CustomerChangeRequestType
  message: string
}

export function isCustomerChangeRequestType(value: string): value is CustomerChangeRequestType {
  return (CUSTOMER_CHANGE_REQUEST_TYPES as readonly string[]).includes(value)
}

export function mapCustomerChangeRequest(row: CustomerChangeRequestRow): CustomerChangeRequest {
  const status = (CUSTOMER_CHANGE_REQUEST_STATUSES as readonly string[]).includes(row.status)
    ? (row.status as CustomerChangeRequestStatus)
    : CUSTOMER_CHANGE_REQUEST_STATUS_SUBMITTED

  return {
    id: row.id,
    orderId: row.order_id,
    requestType: row.request_type,
    status,
    message: row.message,
    createdAt: row.created_at,
  }
}

export const CUSTOMER_CHANGE_REQUEST_FORBIDDEN_RESPONSE_KEYS = [
  'user_id',
  'userId',
  'admin_notes',
  'adminNotes',
  'internal_notes',
  'internalNotes',
  'manager_notes',
  'managerNotes',
  'audit',
  'auditEvents',
  'production_export',
  'productionExport',
  'price_breakdown',
  'priceBreakdown',
  'pricing_source_diagnostic',
  'pricingSourceDiagnostic',
  'workflow_state',
  'workflowState',
  'resolved_by',
  'resolvedBy',
  'updated_at',
  'updatedAt',
] as const
