import { createClient, type SupabaseClient } from '@supabase/supabase-js'

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
  const url = process.env.SUPABASE_URL
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
