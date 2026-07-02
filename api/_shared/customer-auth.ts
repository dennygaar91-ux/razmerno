import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type VerifiedCustomer = {
  userId: string
  email: string
  fullName: string
}

let cachedClient: SupabaseClient | null = null

function getSupabaseAdminClient(): SupabaseClient | null {
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

export async function verifyCustomerAccessToken(
  accessToken: string,
): Promise<VerifiedCustomer | null> {
  const client = getSupabaseAdminClient()
  if (!client || !accessToken.trim()) return null

  const { data, error } = await client.auth.getUser(accessToken)
  if (error || !data.user) return null

  const email = data.user.email?.trim()
  if (!email) return null

  return {
    userId: data.user.id,
    email,
    fullName: getCustomerAuthMetadataFullName(data.user.user_metadata),
  }
}

export function getCustomerAuthMetadataFullName(userMetadata: Record<string, unknown> | null | undefined): string {
  const value = userMetadata?.full_name
  return typeof value === 'string' ? value.trim() : ''
}
