export const CUSTOMER_NOTIFICATION_TYPES = [
  'order_created',
  'order_updated',
  'change_request',
  'system',
] as const

export type CustomerNotificationType = (typeof CUSTOMER_NOTIFICATION_TYPES)[number]

export type CustomerNotificationRow = {
  id: string
  user_id: string
  order_id: string | null
  type: CustomerNotificationType
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export type CustomerNotification = {
  id: string
  type: CustomerNotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  orderId: string | null
}

export function isCustomerNotificationType(value: string): value is CustomerNotificationType {
  return (CUSTOMER_NOTIFICATION_TYPES as readonly string[]).includes(value)
}

export function mapCustomerNotification(row: CustomerNotificationRow): CustomerNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
    orderId: row.order_id,
  }
}

export const CUSTOMER_NOTIFICATION_FORBIDDEN_RESPONSE_KEYS = [
  'user_id',
  'userId',
  'is_read',
  'audit',
  'auditEvents',
  'admin_notes',
  'adminNotes',
  'internal_status',
  'internalStatus',
  'manager_notes',
  'managerNotes',
  'customer_email',
  'customerEmail',
  'manager_email_status',
  'customer_email_status',
  'production_export',
  'productionExport',
  'price_breakdown',
  'priceBreakdown',
  'pricing_source_diagnostic',
  'pricingSourceDiagnostic',
] as const
