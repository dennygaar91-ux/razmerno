import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { CustomerOrderDetailRow } from './customer-order-detail-types'
import { normalizeSupabaseProjectUrl } from './supabase-url'

export type CustomerOrderListRow = {
  id: string
  order_id: string
  public_order_number: string | null
  domain_status: string | null
  created_at: string
  total_price: number
  customer_name: string
  delivery_address: string | null
  delivery_enabled: boolean
}

type OrderListDbRow = {
  id: string
  order_id: string
  public_order_number: string | null
  domain_status: string | null
  created_at: string
  total_price: number
  customer_name: string
  delivery_address: string | null
  delivery_enabled: boolean
}

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

export async function listCustomerOrdersForUser(
  userId: string,
): Promise<{ ok: true; orders: CustomerOrderListRow[] } | { ok: false; error: string }> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'order_storage_unavailable' }

  const { data, error } = await client
    .from('orders')
    .select(
      'id, order_id, public_order_number, domain_status, created_at, total_price, customer_name, delivery_address, delivery_enabled',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<OrderListDbRow[]>()

  if (error) return { ok: false, error: error.message }

  return { ok: true, orders: data ?? [] }
}

const CUSTOMER_ORDER_DETAIL_SELECT =
  'id, user_id, public_order_number, domain_status, created_at, total_price, customer_name, customer_phone, delivery_address, delivery_enabled, delivery_price, assembly_enabled, assembly_price, product_type, dimensions, materials, style, sections, filling, price_breakdown'

export async function getCustomerOrderByIdForUser(
  orderId: string,
  userId: string,
): Promise<
  | { ok: true; order: CustomerOrderDetailRow }
  | { ok: false; notFound: true }
  | { ok: false; error: string }
> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'order_storage_unavailable' }

  const { data, error } = await client
    .from('orders')
    .select(CUSTOMER_ORDER_DETAIL_SELECT)
    .eq('id', orderId)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!data) return { ok: false, notFound: true }
  if (data.user_id !== userId) return { ok: false, notFound: true }

  return { ok: true, order: data as CustomerOrderDetailRow }
}

export async function getOrderUuidByBusinessOrderId(
  userId: string,
  businessOrderId: string,
): Promise<
  | { ok: true; id: string }
  | { ok: false; notFound: true }
  | { ok: false; error: string }
> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'order_storage_unavailable' }

  const { data, error } = await client
    .from('orders')
    .select('id, user_id')
    .eq('order_id', businessOrderId)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!data) return { ok: false, notFound: true }
  if (data.user_id !== userId) return { ok: false, notFound: true }

  return { ok: true, id: data.id as string }
}

export async function getOrderNotificationTargetByBusinessOrderId(
  businessOrderId: string,
): Promise<
  | { ok: true; orderUuid: string; userId: string; publicOrderNumber: string | null }
  | { ok: false; notFound: true }
  | { ok: false; error: string }
> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'order_storage_unavailable' }

  const { data, error } = await client
    .from('orders')
    .select('id, user_id, public_order_number')
    .eq('order_id', businessOrderId)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!data || typeof data.user_id !== 'string' || data.user_id.trim().length === 0) {
    return { ok: false, notFound: true }
  }

  return {
    ok: true,
    orderUuid: data.id as string,
    userId: data.user_id,
    publicOrderNumber:
      typeof data.public_order_number === 'string' ? data.public_order_number : null,
  }
}

export async function getOrderUuidByBusinessOrderIdForService(
  businessOrderId: string,
): Promise<
  | { ok: true; orderUuid: string }
  | { ok: false; notFound: true }
  | { ok: false; error: string }
> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'order_storage_unavailable' }

  const { data, error } = await client
    .from('orders')
    .select('id')
    .eq('order_id', businessOrderId)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!data || typeof data.id !== 'string') return { ok: false, notFound: true }

  return { ok: true, orderUuid: data.id }
}

export async function getBusinessOrderIdByOrderUuid(
  orderUuid: string,
): Promise<
  | { ok: true; businessOrderId: string }
  | { ok: false; notFound: true }
  | { ok: false; error: string }
> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'order_storage_unavailable' }

  const { data, error } = await client
    .from('orders')
    .select('order_id')
    .eq('id', orderUuid)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!data || typeof data.order_id !== 'string') return { ok: false, notFound: true }

  return { ok: true, businessOrderId: data.order_id }
}
