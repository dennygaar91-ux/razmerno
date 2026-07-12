import {
  MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS,
  OPERATIONS_APPROVED_DOMAIN_STATUS,
} from './order-domain'

/** Customer/operations-safe manual payment readiness (no payment provider integration). */
export type PaymentReadinessState = 'awaiting_manual_confirmation' | 'confirmed' | 'not_applicable'

export const PAYMENT_READINESS_FORBIDDEN_RESPONSE_KEYS = [
  'paymentProvider',
  'payment_provider',
  'paymentMethod',
  'payment_method',
  'cardNumber',
  'card_number',
  'acquiring',
  'webhook',
  'paymentIntent',
  'payment_intent',
] as const

export function derivePaymentReadinessState(domainStatus: string | null | undefined): PaymentReadinessState {
  const normalized = typeof domainStatus === 'string' ? domainStatus.trim() : ''

  if (normalized === OPERATIONS_APPROVED_DOMAIN_STATUS) {
    return 'awaiting_manual_confirmation'
  }

  if (normalized === MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS) {
    return 'confirmed'
  }

  return 'not_applicable'
}

export function isManualPaymentConfirmationAllowedForDomainStatus(
  domainStatus: string | null | undefined,
): boolean {
  const normalized = typeof domainStatus === 'string' ? domainStatus.trim() : ''
  return normalized === OPERATIONS_APPROVED_DOMAIN_STATUS
}

export function canTransitionPaymentDomainStatus(fromDomainStatus: string, toDomainStatus: string): boolean {
  return (
    fromDomainStatus.trim() === OPERATIONS_APPROVED_DOMAIN_STATUS &&
    toDomainStatus.trim() === MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS
  )
}

export function isPaymentInstructionsVisibleForState(state: PaymentReadinessState): boolean {
  return state === 'awaiting_manual_confirmation'
}
