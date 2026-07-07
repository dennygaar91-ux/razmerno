import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { CustomerChangeRequestRow } from './customer-change-request-types'
import {
  isValidOperationsChangeRequestDecisionTransition,
  type OperationsChangeRequestDecision,
} from './operations-change-request-policy'
import { mapOperationsChangeRequest, type OperationsChangeRequest } from './operations-change-request-types'
import { normalizeSupabaseProjectUrl } from './supabase-url'

const CHANGE_REQUEST_SELECT = 'id, order_id, user_id, request_type, message, status, created_at, updated_at'

let cachedClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient | null {
  const url = normalizeSupabaseProjectUrl(process.env.SUPABASE_URL)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null

  if (!cachedClient) {
    cachedClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return cachedClient
}

export async function getOperationsChangeRequestById(
  changeRequestId: string,
): Promise<
  | { ok: true; row: CustomerChangeRequestRow }
  | { ok: false; notFound: true }
  | { ok: false; error: string }
> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'change_request_storage_unavailable' }

  const { data, error } = await client
    .from('order_change_requests')
    .select(CHANGE_REQUEST_SELECT)
    .eq('id', changeRequestId)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!data) return { ok: false, notFound: true }

  return { ok: true, row: data as CustomerChangeRequestRow }
}

export async function applyOperationsChangeRequestDecision(
  changeRequestId: string,
  decision: OperationsChangeRequestDecision,
): Promise<
  | { ok: true; changeRequest: OperationsChangeRequest }
  | { ok: false; reason: 'not_found' | 'invalid_state'; message: string }
  | { ok: false; reason: 'error'; message: string }
> {
  const existing = await getOperationsChangeRequestById(changeRequestId)
  if (!existing.ok) {
    if ('notFound' in existing && existing.notFound) {
      return { ok: false, reason: 'not_found', message: 'Change request not found' }
    }
    return { ok: false, reason: 'error', message: existing.error }
  }

  if (!isValidOperationsChangeRequestDecisionTransition(existing.row.status, decision)) {
    return {
      ok: false,
      reason: 'invalid_state',
      message: 'Change request decision is not allowed for the current status',
    }
  }

  const client = getSupabaseClient()
  if (!client) return { ok: false, reason: 'error', message: 'change_request_storage_unavailable' }

  const { data, error } = await client
    .from('order_change_requests')
    .update({
      status: decision,
      updated_at: new Date().toISOString(),
    })
    .eq('id', changeRequestId)
    .select(CHANGE_REQUEST_SELECT)
    .single()

  if (error || !data) {
    return { ok: false, reason: 'error', message: error?.message || 'change_request_update_failed' }
  }

  return { ok: true, changeRequest: mapOperationsChangeRequest(data as CustomerChangeRequestRow) }
}
