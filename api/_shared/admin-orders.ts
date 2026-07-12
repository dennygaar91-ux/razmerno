import { createClient } from '@supabase/supabase-js'
import { INITIAL_ORDER_DOMAIN_STATUS } from './order-domain'
import { normalizeSupabaseProjectUrl } from './supabase-url'

export type AdminOrderSummary = {
  id: string
  status: string
  domainStatus: string
  createdAt: string | null
  updatedAt: string | null
  product: string
  totalPrice: number
  priceBreakdown: Record<string, number> | null
  delivery: {
    enabled: boolean
    price: number
    addressMasked: string | null
  }
  assembly: {
    enabled: boolean
    price: number
    basePrice: number | null
  }
  pricing: {
    status: 'final server snapshot'
    source: string
    diagnostic: string | null
    fallbackReason: string | null
  }
  customer: {
    nameMasked: string
    phoneMasked: string
    emailMasked: string
  }
  email: {
    manager: string
    customer: string
  }
  production: {
    status: string
    warnings: number
    rejects: number
    repairs: number
    revision: number
    manualAllowed: boolean
  }
}

type OrderDbRow = {
  order_id: string
  status: string | null
  domain_status: string | null
  created_at?: string | null
  updated_at?: string | null
  product_type: string | null
  dimensions: { width?: number; height?: number; depth?: number } | null
  total_price: number | null
  price_breakdown: Record<string, number> | null
  delivery_enabled: boolean | null
  delivery_price: number | null
  delivery_address: string | null
  assembly_enabled: boolean | null
  assembly_price: number | null
  assembly_base_price: number | null
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  manager_email_status: string | null
  customer_email_status: string | null
  production_export: unknown | null
  catalog_source_used?: string | null
  pricing_source_diagnostic?: string | null
  pricing_fallback_reason?: string | null
}

function getSupabaseAdminClient() {
  const url = normalizeSupabaseProjectUrl(process.env.SUPABASE_URL)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin env is not configured')

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export function maskName(value: string | null): string {
  const clean = value?.trim()
  if (!clean) return 'Клиент'
  if (clean.length <= 2) return `${clean[0] ?? '*'}*`
  return `${clean.slice(0, 1)}${'•'.repeat(Math.min(clean.length - 1, 6))}`
}

export function maskPhone(value: string | null): string {
  const digits = value?.replace(/\D/g, '') ?? ''
  if (digits.length < 4) return '+7 *** ***-**-**'
  return `+7 *** ***-${digits.slice(-2).padStart(2, '*')}`
}

export function maskEmail(value: string | null): string {
  const clean = value?.trim()
  if (!clean || !clean.includes('@')) return 'email скрыт'
  const [local, domain] = clean.split('@')
  return `${local.slice(0, 1)}***@${domain}`
}

function maskAddress(value: string | null): string | null {
  const clean = value?.trim()
  if (!clean) return null
  if (clean.toLowerCase().includes('мкад')) return 'Адрес за МКАД скрыт'
  return 'Адрес скрыт'
}

function productionSummary(value: unknown): AdminOrderSummary['production'] {
  const fallback = {
    status: 'not-generated',
    warnings: 0,
    rejects: 0,
    repairs: 0,
    revision: 0,
    manualAllowed: false,
  }

  if (!value || typeof value !== 'object') return fallback
  const pack = value as {
    review?: { status?: string; manualChangesAllowed?: boolean }
    rules?: { autoWarnings?: unknown[]; autoRejects?: unknown[]; autoRepairs?: unknown[] }
    revisions?: Array<{ version?: number }>
  }

  const latestRevision = Array.isArray(pack.revisions) && pack.revisions.length > 0
    ? Math.max(...pack.revisions.map((item) => Number(item.version ?? 0)).filter((version) => Number.isFinite(version)))
    : 0

  return {
    status: pack.review?.status ?? 'requires-review',
    warnings: Array.isArray(pack.rules?.autoWarnings) ? pack.rules.autoWarnings.length : 0,
    rejects: Array.isArray(pack.rules?.autoRejects) ? pack.rules.autoRejects.length : 0,
    repairs: Array.isArray(pack.rules?.autoRepairs) ? pack.rules.autoRepairs.length : 0,
    revision: latestRevision,
    manualAllowed: pack.review?.manualChangesAllowed === true,
  }
}

function productLabel(row: OrderDbRow): string {
  const dimensions = row.dimensions
  const size = dimensions?.width && dimensions?.height && dimensions?.depth
    ? `${dimensions.width}×${dimensions.height}×${dimensions.depth}`
    : 'размер не указан'

  const type = row.product_type === 'dresser'
    ? 'Комод'
    : row.product_type === 'nightstand'
      ? 'Тумба'
      : 'Шкаф'

  return `${type} ${size}`
}

function mapPricingAttribution(row: OrderDbRow): AdminOrderSummary['pricing'] {
  const catalogSource = row.catalog_source_used?.trim() || null
  if (!catalogSource) {
    return {
      status: 'final server snapshot',
      source: 'source attribution not persisted',
      diagnostic: null,
      fallbackReason: null,
    }
  }

  return {
    status: 'final server snapshot',
    source: catalogSource,
    diagnostic: row.pricing_source_diagnostic?.trim() || null,
    fallbackReason: row.pricing_fallback_reason?.trim() || null,
  }
}

export function mapOrderRow(row: OrderDbRow): AdminOrderSummary {
  return {
    id: row.order_id,
    status: row.status ?? 'new',
    domainStatus:
      typeof row.domain_status === 'string' && row.domain_status.trim().length > 0
        ? row.domain_status
        : INITIAL_ORDER_DOMAIN_STATUS,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    product: productLabel(row),
    totalPrice: row.total_price ?? 0,
    priceBreakdown: row.price_breakdown ?? null,
    delivery: {
      enabled: row.delivery_enabled === true,
      price: row.delivery_price ?? 0,
      addressMasked: maskAddress(row.delivery_address),
    },
    assembly: {
      enabled: row.assembly_enabled === true,
      price: row.assembly_price ?? 0,
      basePrice: row.assembly_base_price ?? null,
    },
    pricing: mapPricingAttribution(row),
    customer: {
      nameMasked: maskName(row.customer_name),
      phoneMasked: maskPhone(row.customer_phone),
      emailMasked: maskEmail(row.customer_email),
    },
    email: {
      manager: row.manager_email_status ?? 'pending',
      customer: row.customer_email_status ?? 'pending',
    },
    production: productionSummary(row.production_export),
  }
}

const ADMIN_ORDER_SELECT =
  'order_id,status,domain_status,created_at,updated_at,product_type,dimensions,total_price,price_breakdown,delivery_enabled,delivery_price,delivery_address,assembly_enabled,assembly_price,assembly_base_price,customer_name,customer_phone,customer_email,manager_email_status,customer_email_status,production_export,catalog_source_used,pricing_source_diagnostic,pricing_fallback_reason'

export async function getAdminOrderByOrderId(orderId: string): Promise<AdminOrderSummary | null> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('orders')
    .select(ADMIN_ORDER_SELECT)
    .eq('order_id', orderId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return mapOrderRow(data as OrderDbRow)
}

export async function listAdminOrders(limit = 50): Promise<AdminOrderSummary[]> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('orders')
    .select(ADMIN_ORDER_SELECT)
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100))

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => mapOrderRow(row as OrderDbRow))
}

export type AdminProductionDetail = {
  orderId: string
  productionExport: unknown | null
}

export type ManualProductionReviewPatch = {
  orderId: string
  status: 'manually-adjusted' | 'approved-for-basis' | 'blocked' | 'requires-review'
  note: string
}

export type AdminOrderStatus = 'new' | 'in_progress' | 'done'

export function isAdminOrderStatus(value: unknown): value is AdminOrderStatus {
  return value === 'new' || value === 'in_progress' || value === 'done'
}

export async function updateAdminOrderStatus(orderId: string, status: AdminOrderStatus, changedBy = 'admin'): Promise<void> {
  const supabase = getSupabaseAdminClient()

  const { data: current, error: readError } = await supabase
    .from('orders')
    .select('status')
    .eq('order_id', orderId)
    .single()

  if (readError) throw new Error(readError.message)

  const fromStatus = typeof current?.status === 'string' ? current.status : null

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('order_id', orderId)

  if (error) throw new Error(error.message)

  const { error: auditError } = await supabase
    .from('order_status_events')
    .insert({
      order_id: orderId,
      from_status: fromStatus,
      to_status: status,
      changed_by: changedBy,
    })

  if (auditError) throw new Error(auditError.message)
}

export type AdminStatusEvent = {
  id: number
  orderId: string
  fromStatus: string | null
  toStatus: string
  changedBy: string
  createdAt: string | null
}

type OrderStatusEventRow = {
  id: number
  order_id: string
  from_status: string | null
  to_status: string
  changed_by: string
  created_at: string | null
}

export function mapStatusEvent(row: OrderStatusEventRow): AdminStatusEvent {
  return {
    id: row.id,
    orderId: row.order_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    changedBy: row.changed_by,
    createdAt: row.created_at,
  }
}

export async function listAdminStatusEvents(limit = 50): Promise<AdminStatusEvent[]> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('order_status_events')
    .select('id,order_id,from_status,to_status,changed_by,created_at')
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100))

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => mapStatusEvent(row as OrderStatusEventRow))
}

export async function getAdminProductionDetail(orderId: string): Promise<AdminProductionDetail> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('orders')
    .select('order_id,production_export')
    .eq('order_id', orderId)
    .single()

  if (error) throw new Error(error.message)

  return {
    orderId: String(data?.order_id ?? orderId),
    productionExport: data?.production_export ?? null,
  }
}

function appendManualRevision(productionExport: unknown, patch: ManualProductionReviewPatch): unknown {
  if (!productionExport || typeof productionExport !== 'object') return productionExport

  const pack = productionExport as {
    review?: Record<string, unknown>
    revisions?: Array<Record<string, unknown>>
  }

  const revisions = Array.isArray(pack.revisions) ? pack.revisions : []
  const latest = revisions.reduce((max, item) => {
    const version = Number(item.version ?? 0)
    return Number.isFinite(version) && version > max ? version : max
  }, 0)

  const nextRevision = {
    id: `production-rev-${Date.now()}-${latest + 1}`,
    version: latest + 1,
    status: patch.status,
    source: 'manual',
    createdAt: new Date().toISOString(),
    changedBy: 'admin',
    note: patch.note,
    changes: [
      {
        field: 'review.status',
        before: pack.review?.status ?? null,
        after: patch.status,
        reason: patch.note,
      },
    ],
  }

  return {
    ...pack,
    review: {
      ...(pack.review ?? {}),
      status: patch.status,
      manualChangesAllowed: true,
      visibleToClient: false,
    },
    revisions: [...revisions, nextRevision],
  }
}

export async function updateAdminProductionReview(patch: ManualProductionReviewPatch): Promise<void> {
  const supabase = getSupabaseAdminClient()

  const { data, error: readError } = await supabase
    .from('orders')
    .select('production_export')
    .eq('order_id', patch.orderId)
    .single()

  if (readError) throw new Error(readError.message)

  const nextProductionExport = appendManualRevision(data?.production_export ?? null, patch)

  const { error } = await supabase
    .from('orders')
    .update({ production_export: nextProductionExport })
    .eq('order_id', patch.orderId)

  if (error) throw new Error(error.message)
}
