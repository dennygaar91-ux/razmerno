import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { normalizeSupabaseProjectUrl } from './supabase-url'
import {
  mapCustomerNotification,
  type CustomerNotification,
  type CustomerNotificationRow,
  type CustomerNotificationType,
} from './customer-notification-types'

const NOTIFICATION_SELECT = 'id, user_id, order_id, type, title, message, is_read, created_at'

export type CreateCustomerNotificationInput = {
  userId: string
  orderId: string | null
  type: CustomerNotificationType
  title: string
  message: string
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

export async function createCustomerNotification(
  input: CreateCustomerNotificationInput,
): Promise<{ ok: true; notification: CustomerNotification } | { ok: false; error: string }> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'notification_storage_unavailable' }

  const { data, error } = await client
    .from('order_notifications')
    .insert({
      user_id: input.userId,
      order_id: input.orderId,
      type: input.type,
      title: input.title,
      message: input.message,
      is_read: false,
    })
    .select(NOTIFICATION_SELECT)
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message || 'notification_insert_failed' }
  }

  return { ok: true, notification: mapCustomerNotification(data as CustomerNotificationRow) }
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

export async function markCustomerNotificationReadForUser(
  notificationId: string,
  userId: string,
): Promise<
  | { ok: true; notification: CustomerNotification }
  | { ok: false; notFound: true }
  | { ok: false; error: string }
> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'notification_storage_unavailable' }

  const { data, error } = await client
    .from('order_notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select(NOTIFICATION_SELECT)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!data) return { ok: false, notFound: true }

  return { ok: true, notification: mapCustomerNotification(data as CustomerNotificationRow) }
}

export async function markAllCustomerNotificationsReadForUser(
  userId: string,
): Promise<{ ok: true; updatedCount: number } | { ok: false; error: string }> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'notification_storage_unavailable' }

  const { data, error } = await client
    .from('order_notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select('id')

  if (error) return { ok: false, error: error.message }

  return { ok: true, updatedCount: data?.length ?? 0 }
}
