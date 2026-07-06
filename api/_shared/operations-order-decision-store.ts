import { createClient } from '@supabase/supabase-js'

import {
  INITIAL_ORDER_DOMAIN_STATUS,
  LEGACY_ORDER_STATUS_AFTER_APPROVAL,
  LEGACY_ORDER_STATUS_ON_SUBMIT,
  OPERATIONS_APPROVED_DOMAIN_STATUS,
  OPERATIONS_REJECTED_DOMAIN_STATUS,
} from './order-domain'
import type { OperationsOrderDecisionInput, OperationsOrderDecisionResult } from './operations-order-decision-types'
import { normalizeSupabaseProjectUrl } from './supabase-url'

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

export async function applyOperationsOrderDecision(
  input: OperationsOrderDecisionInput,
  changedBy = 'operations',
): Promise<
  | { ok: true; result: OperationsOrderDecisionResult }
  | { ok: false; reason: 'not_found' | 'invalid_state' | 'error'; message: string }
> {
  try {
    const supabase = getSupabaseAdminClient()

    const { data: current, error: readError } = await supabase
      .from('orders')
      .select('status,domain_status')
      .eq('order_id', input.orderId)
      .maybeSingle()

    if (readError) return { ok: false, reason: 'error', message: readError.message }
    if (!current) return { ok: false, reason: 'not_found', message: 'Order not found' }

    const fromDomainStatus =
      typeof current.domain_status === 'string' && current.domain_status.trim().length > 0
        ? current.domain_status
        : INITIAL_ORDER_DOMAIN_STATUS

    if (fromDomainStatus !== INITIAL_ORDER_DOMAIN_STATUS) {
      return {
        ok: false,
        reason: 'invalid_state',
        message: 'Заказ не находится в статусе ручной проверки.',
      }
    }

    const fromLegacyStatus = typeof current.status === 'string' ? current.status : LEGACY_ORDER_STATUS_ON_SUBMIT
    const nextDomainStatus =
      input.decision === 'approve' ? OPERATIONS_APPROVED_DOMAIN_STATUS : OPERATIONS_REJECTED_DOMAIN_STATUS
    const nextLegacyStatus =
      input.decision === 'approve' ? LEGACY_ORDER_STATUS_AFTER_APPROVAL : fromLegacyStatus

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        domain_status: nextDomainStatus,
        status: nextLegacyStatus,
      })
      .eq('order_id', input.orderId)

    if (updateError) return { ok: false, reason: 'error', message: updateError.message }

    const auditChangedBy =
      input.decision === 'approve' ? `${changedBy}:approve` : `${changedBy}:reject`

    const { error: auditError } = await supabase.from('order_status_events').insert({
      order_id: input.orderId,
      from_status: fromDomainStatus,
      to_status: nextDomainStatus,
      changed_by: auditChangedBy,
    })

    if (auditError) return { ok: false, reason: 'error', message: auditError.message }

    return {
      ok: true,
      result: {
        orderId: input.orderId,
        decision: input.decision,
        domainStatus: nextDomainStatus,
        legacyStatus: nextLegacyStatus,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, reason: 'error', message }
  }
}
