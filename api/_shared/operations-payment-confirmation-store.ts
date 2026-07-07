import { createClient } from '@supabase/supabase-js'

import {
  LEGACY_ORDER_STATUS_AFTER_APPROVAL,
  MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS,
  OPERATIONS_APPROVED_DOMAIN_STATUS,
} from './order-domain'
import { isManualPaymentConfirmationAllowedForDomainStatus } from './payment-readiness-domain'
import type { OperationsPaymentConfirmationInput } from './operations-payment-confirmation-validation'
import { normalizeSupabaseProjectUrl } from './supabase-url'

export type OperationsPaymentConfirmationResult = {
  orderId: string
  domainStatus: string
  legacyStatus: string
  note: string | null
}

function getSupabaseAdminClient() {
  const url = normalizeSupabaseProjectUrl(process.env.SUPABASE_URL)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin env is not configured')

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function applyOperationsManualPaymentConfirmation(
  input: OperationsPaymentConfirmationInput,
  changedBy = 'operations',
): Promise<
  | { ok: true; result: OperationsPaymentConfirmationResult }
  | { ok: false; reason: 'not_found' | 'invalid_state' | 'error'; message: string }
> {
  try {
    const supabase = getSupabaseAdminClient()

    const { data: current, error: readError } = await supabase
      .from('orders')
      .select('status,domain_status,total_price,production_export')
      .eq('order_id', input.orderId)
      .maybeSingle()

    if (readError) return { ok: false, reason: 'error', message: readError.message }
    if (!current) return { ok: false, reason: 'not_found', message: 'Order not found' }

    const fromDomainStatus =
      typeof current.domain_status === 'string' ? current.domain_status.trim() : ''

    if (!isManualPaymentConfirmationAllowedForDomainStatus(fromDomainStatus)) {
      return {
        ok: false,
        reason: 'invalid_state',
        message: 'Подтверждение оплаты доступно только для заказов в статусе Оплата.',
      }
    }

    const fromLegacyStatus = typeof current.status === 'string' ? current.status : LEGACY_ORDER_STATUS_AFTER_APPROVAL
    const nextDomainStatus = MANUAL_PAYMENT_CONFIRMED_DOMAIN_STATUS
    const nextLegacyStatus = fromLegacyStatus

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        domain_status: nextDomainStatus,
      })
      .eq('order_id', input.orderId)

    if (updateError) return { ok: false, reason: 'error', message: updateError.message }

    const auditChangedBy = `${changedBy}:payment_confirm`

    const { error: auditError } = await supabase.from('order_status_events').insert({
      order_id: input.orderId,
      from_status: fromDomainStatus || OPERATIONS_APPROVED_DOMAIN_STATUS,
      to_status: nextDomainStatus,
      changed_by: auditChangedBy,
      reason: input.note,
    })

    if (auditError) return { ok: false, reason: 'error', message: auditError.message }

    return {
      ok: true,
      result: {
        orderId: input.orderId,
        domainStatus: nextDomainStatus,
        legacyStatus: nextLegacyStatus,
        note: input.note,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, reason: 'error', message }
  }
}
