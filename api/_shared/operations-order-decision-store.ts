import { createClient } from '@supabase/supabase-js'

import {
  INITIAL_ORDER_DOMAIN_STATUS,
  LEGACY_ORDER_STATUS_AFTER_APPROVAL,
  LEGACY_ORDER_STATUS_ON_SUBMIT,
  OPERATIONS_APPROVED_DOMAIN_STATUS,
  OPERATIONS_REJECTED_DOMAIN_STATUS,
} from './order-domain'
import type {
  OperationsOrderDecisionInput,
  OperationsOrderDecisionResult,
  OperationsDecisionAudit,
  OperationsDecisionHistoryEntry,
} from './operations-order-decision-types'
import { OPERATIONS_ORDER_STATUS_HISTORY_LIMIT } from './operations-order-decision-types'
import {
  deriveLatestOperationsDecisionAudit,
  mapOrderStatusEventHistoryRow,
  type OrderStatusEventHistoryRow,
} from './operations-order-decision-history'
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

type OrderStatusEventRow = OrderStatusEventHistoryRow

export async function listOperationsOrderStatusHistoryByOrderId(
  orderId: string,
  limit = OPERATIONS_ORDER_STATUS_HISTORY_LIMIT,
): Promise<OperationsDecisionHistoryEntry[]> {
  try {
    const supabase = getSupabaseAdminClient()
    const cappedLimit = Math.min(Math.max(limit, 1), OPERATIONS_ORDER_STATUS_HISTORY_LIMIT)

    const { data, error } = await supabase
      .from('order_status_events')
      .select('id,from_status,to_status,changed_by,reason,created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(cappedLimit)

    if (error) throw new Error(error.message)

    return (data ?? []).map((row) => mapOrderStatusEventHistoryRow(row as OrderStatusEventRow))
  } catch {
    return []
  }
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

    const auditReason = input.reason

    const { error: auditError } = await supabase.from('order_status_events').insert({
      order_id: input.orderId,
      from_status: fromDomainStatus,
      to_status: nextDomainStatus,
      changed_by: auditChangedBy,
      reason: auditReason,
    })

    if (auditError) return { ok: false, reason: 'error', message: auditError.message }

    return {
      ok: true,
      result: {
        orderId: input.orderId,
        decision: input.decision,
        domainStatus: nextDomainStatus,
        legacyStatus: nextLegacyStatus,
        auditReason,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, reason: 'error', message }
  }
}

export async function getLatestOperationsDecisionAuditByOrderId(
  orderId: string,
): Promise<OperationsDecisionAudit | null> {
  const history = await listOperationsOrderStatusHistoryByOrderId(orderId)
  return deriveLatestOperationsDecisionAudit(history)
}
