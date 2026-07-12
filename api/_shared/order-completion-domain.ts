import {
  MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS,
  ORDER_COMPLETED_DOMAIN_STATUS,
} from './order-domain'

export function isOrderCompletionAllowedForDomainStatus(
  domainStatus: string | null | undefined,
): boolean {
  const normalized = typeof domainStatus === 'string' ? domainStatus.trim() : ''
  return normalized === MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS
}

export function canTransitionOrderCompletionDomainStatus(
  fromDomainStatus: string,
  toDomainStatus: string,
): boolean {
  return (
    fromDomainStatus.trim() === MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS &&
    toDomainStatus.trim() === ORDER_COMPLETED_DOMAIN_STATUS
  )
}
