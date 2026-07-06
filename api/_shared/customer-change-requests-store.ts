import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { normalizeSupabaseProjectUrl } from './supabase-url'
import {
  CUSTOMER_CHANGE_REQUEST_STATUS_SUBMITTED,
  mapCustomerChangeRequest,
  type CustomerChangeRequest,
  type CustomerChangeRequestCreateInput,
  type CustomerChangeRequestRow,
} from './customer-change-request-types'

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

export async function createCustomerChangeRequest(
  userId: string,
  input: CustomerChangeRequestCreateInput,
): Promise<{ ok: true; changeRequest: CustomerChangeRequest } | { ok: false; error: string }> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'change_request_storage_unavailable' }

  const { data, error } = await client
    .from('order_change_requests')
    .insert({
      order_id: input.orderId,
      user_id: userId,
      request_type: input.requestType,
      message: input.message,
      status: CUSTOMER_CHANGE_REQUEST_STATUS_SUBMITTED,
    })
    .select(CHANGE_REQUEST_SELECT)
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message || 'change_request_insert_failed' }
  }

  return { ok: true, changeRequest: mapCustomerChangeRequest(data as CustomerChangeRequestRow) }
}

export async function listCustomerChangeRequestsForOrder(
  orderId: string,
  userId: string,
): Promise<{ ok: true; changeRequests: CustomerChangeRequest[] } | { ok: false; error: string }> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'change_request_storage_unavailable' }

  const { data, error } = await client
    .from('order_change_requests')
    .select(CHANGE_REQUEST_SELECT)
    .eq('order_id', orderId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<CustomerChangeRequestRow[]>()

  if (error) return { ok: false, error: error.message }

  return {
    ok: true,
    changeRequests: (data ?? []).map(mapCustomerChangeRequest),
  }
}
