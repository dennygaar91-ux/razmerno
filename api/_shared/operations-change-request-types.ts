import {
  CUSTOMER_CHANGE_REQUEST_TYPES,
  type CustomerChangeRequestRow,
  type CustomerChangeRequestType,
} from './customer-change-request-types'

export type OperationsChangeRequest = {
  id: string
  requestType: CustomerChangeRequestType
  requestTypeLabel: string
  status: string
  message: string
  createdAt: string
}

const REQUEST_TYPE_LABELS: Record<CustomerChangeRequestType, string> = {
  dimensions: 'Размеры',
  materials: 'Материалы',
  configuration: 'Комплектация',
  delivery: 'Доставка',
  other: 'Другое',
}

export const OPERATIONS_CHANGE_REQUEST_FORBIDDEN_RESPONSE_KEYS = [
  'user_id',
  'userId',
  'order_id',
  'orderId',
  'updated_at',
  'updatedAt',
  'admin_notes',
  'adminNotes',
  'internal_notes',
  'internalNotes',
  'customer_name',
  'customer_phone',
  'customer_email',
] as const

export function getOperationsChangeRequestTypeLabel(requestType: CustomerChangeRequestType): string {
  return REQUEST_TYPE_LABELS[requestType] ?? requestType
}

export function mapOperationsChangeRequest(row: CustomerChangeRequestRow): OperationsChangeRequest {
  const requestType = CUSTOMER_CHANGE_REQUEST_TYPES.includes(row.request_type as CustomerChangeRequestType)
    ? (row.request_type as CustomerChangeRequestType)
    : 'other'

  return {
    id: row.id,
    requestType,
    requestTypeLabel: getOperationsChangeRequestTypeLabel(requestType),
    status: row.status,
    message: row.message,
    createdAt: row.created_at,
  }
}

export function getOperationsChangeRequestsEmptyMessage(): string {
  return 'Запросов на изменение от клиента пока нет.'
}

export function getOperationsChangeRequestsSectionTitle(): string {
  return 'Запросы на изменение'
}
