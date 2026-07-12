import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { normalizeSupabaseProjectUrl } from './supabase-url'
import seedItems from '../../src/pricing/seed/price-items.json'
import type { RawPriceItem } from '../../src/pricing/types'

type StoreQuery = {
  itemType?: string
  producer?: string
  thicknessMm?: number
  limit?: number
}

type DbPriceItem = {
  item_type: string
  producer: string | null
  brand: string | null
  collection: string | null
  article: string | null
  name: string
  decor_name: string | null
  texture: string | null
  category: string | null
  thickness_mm: number | null
  width_mm: number | null
  length_mm: number | null
  unit: string
  source_price: number
  markup_multiplier: number
  retail_price: number
  availability_status: string | null
  source_sheet: string
  source_row: number | null
  source_note: string | null
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

function mapDbItem(row: DbPriceItem): RawPriceItem {
  return {
    itemType: row.item_type as RawPriceItem['itemType'],
    producer: row.producer ?? undefined,
    brand: row.brand ?? undefined,
    collection: row.collection ?? undefined,
    article: row.article ?? undefined,
    name: row.name,
    decorName: row.decor_name ?? undefined,
    texture: row.texture ?? undefined,
    category: row.category ?? undefined,
    thicknessMm: row.thickness_mm ?? undefined,
    widthMm: row.width_mm ?? undefined,
    lengthMm: row.length_mm ?? undefined,
    unit: row.unit,
    sourcePrice: row.source_price,
    markupMultiplier: row.markup_multiplier,
    retailPrice: row.retail_price,
    availabilityStatus: row.availability_status ?? undefined,
    sourceSheet: row.source_sheet,
    sourceRow: row.source_row ?? 0,
    sourceNote: row.source_note ?? undefined,
  }
}

function filterSeed(query: StoreQuery): RawPriceItem[] {
  return (seedItems as RawPriceItem[])
    .filter((item) => {
      if (query.itemType && item.itemType !== query.itemType) return false
      if (query.producer && item.producer !== query.producer) return false
      if (query.thicknessMm !== undefined && item.thicknessMm !== query.thicknessMm) return false
      return true
    })
    .slice(0, query.limit ?? 500)
}

export async function fetchPriceItems(query: StoreQuery): Promise<{ source: 'supabase' | 'seed'; items: RawPriceItem[] }> {
  const client = getSupabaseClient()

  if (!client) {
    return {
      source: 'seed',
      items: filterSeed(query),
    }
  }

  let dbQuery = client
    .from('price_items')
    .select('item_type,producer,brand,collection,article,name,decor_name,texture,category,thickness_mm,width_mm,length_mm,unit,source_price,markup_multiplier,retail_price,availability_status,source_sheet,source_row,source_note')
    .eq('is_active', true)
    .limit(query.limit ?? 500)

  if (query.itemType) dbQuery = dbQuery.eq('item_type', query.itemType)
  if (query.producer) dbQuery = dbQuery.eq('producer', query.producer)
  if (query.thicknessMm !== undefined) dbQuery = dbQuery.eq('thickness_mm', query.thicknessMm)

  const { data, error } = await dbQuery

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as DbPriceItem[]

  return {
    source: 'supabase',
    items: rows.map((row) => mapDbItem(row)),
  }
}
