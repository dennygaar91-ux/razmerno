import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { CustomerProfile, CustomerProfilePatch } from './customer-profile'
import { mapProfileRow } from './customer-profile'
import { normalizeSupabaseProjectUrl } from './supabase-url'

type ProfileRow = {
  user_id: string
  full_name: string
  email: string
  phone: string | null
  created_at: string
  updated_at: string
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

export async function getProfileByUserId(userId: string): Promise<CustomerProfile | null> {
  const client = getSupabaseClient()
  if (!client) return null

  const { data, error } = await client
    .from('profiles')
    .select('user_id, full_name, email, phone, created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle<ProfileRow>()

  if (error || !data) return null
  return mapProfileRow(data)
}

export async function ensureCustomerProfile(input: {
  userId: string
  email: string
  fullName?: string
}): Promise<{ ok: true; profile: CustomerProfile } | { ok: false; error: string }> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'profile_storage_unavailable' }

  const existing = await getProfileByUserId(input.userId)
  if (existing) return { ok: true, profile: existing }

  const now = new Date().toISOString()
  const insertRow = {
    user_id: input.userId,
    full_name: input.fullName?.trim() || '',
    email: input.email,
    phone: null,
    created_at: now,
    updated_at: now,
  }

  const { data, error } = await client
    .from('profiles')
    .insert(insertRow)
    .select('user_id, full_name, email, phone, created_at, updated_at')
    .single<ProfileRow>()

  if (error || !data) {
    if (error?.code === '23505') {
      const retry = await getProfileByUserId(input.userId)
      if (retry) return { ok: true, profile: retry }
    }
    return { ok: false, error: error?.message || 'profile_insert_failed' }
  }

  return { ok: true, profile: mapProfileRow(data) }
}

export async function updateCustomerProfile(
  userId: string,
  patch: CustomerProfilePatch,
): Promise<{ ok: true; profile: CustomerProfile } | { ok: false; error: string }> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'profile_storage_unavailable' }

  const updateRow: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
  }

  if ('full_name' in patch) updateRow.full_name = patch.full_name ?? ''
  if ('phone' in patch) updateRow.phone = patch.phone ?? null

  const { data, error } = await client
    .from('profiles')
    .update(updateRow)
    .eq('user_id', userId)
    .select('user_id, full_name, email, phone, created_at, updated_at')
    .maybeSingle<ProfileRow>()

  if (error || !data) {
    return { ok: false, error: error?.message || 'profile_update_failed' }
  }

  return { ok: true, profile: mapProfileRow(data) }
}
