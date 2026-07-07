import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { normalizeSupabaseProjectUrl } from './supabase-url'
import {
  mapOperationsManualPricingDraft,
  OPERATIONS_MANUAL_PRICING_DRAFT_STATUS,
  type OperationsManualPricingDraft,
  type OperationsManualPricingDraftRow,
  type OperationsManualPricingDraftSaveInput,
} from './operations-manual-pricing-draft-types'

const DRAFT_SELECT =
  'id,order_id,manual_total_price,reason,status,created_by,updated_by,created_at,updated_at'

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

export async function getOperationsManualPricingDraftByOrderId(
  orderId: string,
): Promise<{ ok: true; draft: OperationsManualPricingDraft | null } | { ok: false; error: string }> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'manual_pricing_draft_storage_unavailable' }

  const { data, error } = await client
    .from('order_manual_pricing_drafts')
    .select(DRAFT_SELECT)
    .eq('order_id', orderId)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!data) return { ok: true, draft: null }

  return { ok: true, draft: mapOperationsManualPricingDraft(data as OperationsManualPricingDraftRow) }
}

export async function upsertOperationsManualPricingDraft(
  input: OperationsManualPricingDraftSaveInput,
  actor = 'admin',
): Promise<{ ok: true; draft: OperationsManualPricingDraft } | { ok: false; error: string }> {
  const client = getSupabaseClient()
  if (!client) return { ok: false, error: 'manual_pricing_draft_storage_unavailable' }

  const now = new Date().toISOString()

  const { data: existing, error: readError } = await client
    .from('order_manual_pricing_drafts')
    .select('id,created_by')
    .eq('order_id', input.orderId)
    .maybeSingle()

  if (readError) return { ok: false, error: readError.message }

  if (existing) {
    const { data, error } = await client
      .from('order_manual_pricing_drafts')
      .update({
        manual_total_price: input.manualTotalPrice,
        reason: input.reason,
        status: OPERATIONS_MANUAL_PRICING_DRAFT_STATUS,
        updated_by: actor,
        updated_at: now,
      })
      .eq('order_id', input.orderId)
      .select(DRAFT_SELECT)
      .single()

    if (error || !data) {
      return { ok: false, error: error?.message || 'manual_pricing_draft_upsert_failed' }
    }

    return { ok: true, draft: mapOperationsManualPricingDraft(data as OperationsManualPricingDraftRow) }
  }

  const { data, error } = await client
    .from('order_manual_pricing_drafts')
    .insert({
      order_id: input.orderId,
      manual_total_price: input.manualTotalPrice,
      reason: input.reason,
      status: OPERATIONS_MANUAL_PRICING_DRAFT_STATUS,
      created_by: actor,
      updated_by: actor,
      created_at: now,
      updated_at: now,
    })
    .select(DRAFT_SELECT)
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message || 'manual_pricing_draft_upsert_failed' }
  }

  return { ok: true, draft: mapOperationsManualPricingDraft(data as OperationsManualPricingDraftRow) }
}
