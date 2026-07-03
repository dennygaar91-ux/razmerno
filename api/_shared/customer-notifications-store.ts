import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  mapCustomerNotification,
  type CustomerNotification,
  type CustomerNotificationRow,
} from './customer-notification-types'

const NOTIFICATION_SELECT = 'id, user_id, order_id, type, title, message, is_read, created_at'

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

export async function listCustomerNotificationsForUser(
  userId: string,
): Promise<{ ok: true; notifications: CustomerNotification[] } | { ok: false; error: string }> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'notification_storage_unavailable' }

  const { data, error } = await client
    .from('order_notifications')
    .select(NOTIFICATION_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<CustomerNotificationRow[]>()

  if (error) return { ok: false, error: error.message }

  return {
    ok: true,
    notifications: (data ?? []).map(mapCustomerNotification),
  }
}
