import {
  INITIAL_ORDER_DOMAIN_STATUS,
  MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS,
  OPERATIONS_APPROVED_DOMAIN_STATUS,
  OPERATIONS_REJECTED_DOMAIN_STATUS,
  ORDER_COMPLETED_DOMAIN_STATUS,
} from './order-domain'

export type CustomerOrderStatusStage =
  | 'review'
  | 'payment'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'unknown'

export type CustomerOrderStatus = {
  label: string
  stage: CustomerOrderStatusStage
  description: string
  nextStep: string | null
}

export function mapCustomerOrderStatus(domainStatus: string | null | undefined): CustomerOrderStatus {
  const normalized = typeof domainStatus === 'string' ? domainStatus.trim() : ''

  if (normalized === INITIAL_ORDER_DOMAIN_STATUS) {
    return {
      label: 'На проверке',
      stage: 'review',
      description: 'Мы проверяем заявку и уточняем детали перед следующим шагом.',
      nextStep: 'После проверки вы получите уведомление о дальнейших действиях.',
    }
  }

  if (normalized === OPERATIONS_APPROVED_DOMAIN_STATUS) {
    return {
      label: 'Ожидает оплаты',
      stage: 'payment',
      description: 'Заявка проверена. Следующий шаг — оплата по инструкции менеджера.',
      nextStep: 'Дождитесь связи с менеджером или проверьте уведомления в кабинете.',
    }
  }

  if (normalized === MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS) {
    return {
      label: 'В работе',
      stage: 'in_progress',
      description: 'Оплата подтверждена. Заявка передана в работу.',
      nextStep: 'Следите за уведомлениями в кабинете.',
    }
  }

  if (normalized === ORDER_COMPLETED_DOMAIN_STATUS) {
    return {
      label: 'Завершено',
      stage: 'completed',
      description: 'Заказ завершён.',
      nextStep: null,
    }
  }

  if (normalized === OPERATIONS_REJECTED_DOMAIN_STATUS) {
    return {
      label: 'Отменён',
      stage: 'cancelled',
      description: 'Заявка отменена на этапе проверки.',
      nextStep: null,
    }
  }

  if (normalized.length > 0) {
    return {
      label: normalized,
      stage: 'unknown',
      description: 'Статус заявки уточняется.',
      nextStep: null,
    }
  }

  return {
    label: 'Статус уточняется',
    stage: 'unknown',
    description: 'Статус заявки пока не определён.',
    nextStep: null,
  }
}

export const CUSTOMER_ORDER_STATUS_FORBIDDEN_RESPONSE_KEYS = [
  'domain_status',
  'domainStatus',
  'changed_by',
  'changedBy',
  'auditReason',
  'decisionHistory',
  'latestDecisionAudit',
  'reviewDecisionAllowed',
  'production_export',
  'productionExport',
] as const
