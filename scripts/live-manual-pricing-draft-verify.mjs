#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { createHmac } from 'node:crypto'
import { getEnvPresenceReport, loadProjectEnvFiles, normalizeSupabaseProjectUrl } from './load-project-env.mjs'

const MIGRATION_PATH = 'supabase/migrations/20260705_add_order_manual_pricing_drafts.sql'
const TABLE_NAME = 'order_manual_pricing_drafts'
const REQUIRED_ENV_KEYS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_API_KEY',
]
const OPTIONAL_SMOKE_ENV_KEYS = [
  'SMOKE_BASE_URL',
  'LIVE_VERIFY_ORDER_ID',
  'SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
]

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function redactUrl(url) {
  try {
    const parsed = new URL(url)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return '[invalid-url]'
  }
}

function signAdminToken(secret) {
  const payload = {
    sub: 'admin',
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60,
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required env: ${name}`)
  return value
}

async function checkTableWithServiceRole(supabaseUrl, serviceRoleKey) {
  const normalizedUrl = normalizeSupabaseProjectUrl(supabaseUrl)
  if (!normalizedUrl) throw new Error('SUPABASE_URL is empty or invalid')

  const client = createClient(normalizedUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error } = await client.from(TABLE_NAME).select('order_id', { head: true, count: 'exact' })
  if (error) {
    if (/relation .* does not exist|Could not find the table/i.test(error.message)) {
      return { exists: false, message: error.message }
    }
    throw new Error(`Service role table probe failed: ${error.message}`)
  }

  return { exists: true }
}

async function checkAnonDenied(supabaseUrl, anonKey) {
  const normalizedUrl = normalizeSupabaseProjectUrl(supabaseUrl)
  if (!normalizedUrl) throw new Error('SUPABASE_URL is empty or invalid')

  const client = createClient(normalizedUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await client.from(TABLE_NAME).select('order_id').limit(1)
  if (error) {
    return { denied: true, mode: 'error', message: error.message }
  }

  return { denied: data?.length === 0, mode: 'empty', message: 'anon select returned no rows' }
}

async function requestJson(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, options)
  const text = await response.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = { raw: text.slice(0, 300) }
  }
  return { status: response.status, json }
}

async function checkApiRuntimeReady(baseUrl, adminKey, orderId) {
  const health = await requestJson(baseUrl, '/api/health')
  if (health.status >= 500 && !health.json) {
    return {
      ok: false,
      detail: `API health unreachable at ${redactUrl(baseUrl)} (status ${health.status})`,
    }
  }

  const checks = Array.isArray(health.json?.checks) ? health.json.checks : []
  const missingSupabase = checks
    .filter((item) => typeof item?.name === 'string' && item.name.includes('SUPABASE') && item.present !== true)
    .map((item) => item.name)

  if (missingSupabase.length > 0) {
    return {
      ok: false,
      detail: `API runtime at ${redactUrl(baseUrl)} is missing ${missingSupabase.join(', ')}. Restart vercel dev with .env.local loaded on the same port as SMOKE_BASE_URL.`,
    }
  }

  const token = signAdminToken(adminKey)
  const review = await requestJson(
    baseUrl,
    `/api/operations/order?orderId=${encodeURIComponent(orderId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )

  if (review.status !== 200 || review.json?.ok !== true) {
    const message = typeof review.json?.message === 'string' ? review.json.message : 'unknown'
    return {
      ok: false,
      detail: `Operations order readback failed at ${redactUrl(baseUrl)} (status ${review.status}, message: ${message})`,
    }
  }

  return { ok: true, detail: { healthStatus: health.status, reviewStatus: review.status } }
}

async function runApiSmoke({ baseUrl, adminKey, orderId, draftPrice, draftReason }) {
  const token = signAdminToken(adminKey)
  const authHeader = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const before = await requestJson(baseUrl, `/api/operations/order?orderId=${encodeURIComponent(orderId)}`, {
    headers: authHeader,
  })
  assert(before.status === 200, `Pre-save review failed with status ${before.status}`)
  assert(before.json?.ok === true, 'Pre-save review response not ok')

  const beforeReview = before.json.review
  const beforeStatus = beforeReview.status
  const beforeProduction = beforeReview.productionReviewStatus
  const beforeTotal = beforeReview.totalPrice

  const save = await requestJson(baseUrl, '/api/operations/manual-pricing-draft', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({
      orderId,
      manualTotalPrice: draftPrice,
      reason: draftReason,
    }),
  })
  assert(save.status === 200, `Save draft failed with status ${save.status}`)
  assert(save.json?.ok === true, 'Save draft response not ok')
  assert(save.json?.manualPricingDraft?.status === 'draft', 'Saved draft status is not draft')

  const serializedSave = JSON.stringify(save.json)
  for (const forbidden of ['production_export', 'price_breakdown', 'customer_name', 'customer_email']) {
    assert(!serializedSave.includes(forbidden), `Forbidden key leaked in save response: ${forbidden}`)
  }

  const after = await requestJson(baseUrl, `/api/operations/order?orderId=${encodeURIComponent(orderId)}`, {
    headers: authHeader,
  })
  assert(after.status === 200, `Post-save review failed with status ${after.status}`)
  assert(after.json?.review?.manualPricingDraft?.manualTotalPrice === draftPrice, 'Readback draft price mismatch')
  assert(after.json?.review?.status === beforeStatus, 'Order status mutated')
  assert(after.json?.review?.productionReviewStatus === beforeProduction, 'Production status mutated')
  assert(after.json?.review?.totalPrice === beforeTotal, 'Customer-facing total price mutated')

  const unauthorized = await requestJson(baseUrl, '/api/operations/manual-pricing-draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, manualTotalPrice: draftPrice }),
  })
  assert(unauthorized.status === 401, 'Missing bearer token did not return 401')

  return {
    beforeStatus,
    beforeProduction,
    beforeTotal,
    savedDraftPrice: save.json.manualPricingDraft.manualTotalPrice,
    readbackDraftPrice: after.json.review.manualPricingDraft.manualTotalPrice,
  }
}

async function main() {
  const loadedEnvFiles = loadProjectEnvFiles()
  const envPresence = getEnvPresenceReport([...REQUIRED_ENV_KEYS, ...OPTIONAL_SMOKE_ENV_KEYS])
  const missingRequired = envPresence.filter((item) => REQUIRED_ENV_KEYS.includes(item.name) && !item.present)

  if (missingRequired.length > 0) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          blocker: 'missing_required_env',
          loadedEnvFiles,
          envPresence,
          message: `Missing required env: ${missingRequired.map((item) => item.name).join(', ')}`,
        },
        null,
        2,
      ),
    )
    process.exit(2)
  }

  const supabaseUrl = requiredEnv('SUPABASE_URL')
  const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY')
  const adminKey = requiredEnv('ADMIN_API_KEY')

  const anonKey =
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    ''

  const smokeBaseUrl = process.env.SMOKE_BASE_URL?.trim() || ''
  const verifyOrderId = process.env.LIVE_VERIFY_ORDER_ID?.trim() || ''
  const draftPrice = Number(process.env.LIVE_VERIFY_DRAFT_PRICE || '123000')
  const draftReason = process.env.LIVE_VERIFY_DRAFT_REASON || 'Live verification smoke draft'

  const report = {
    ok: false,
    supabaseHost: redactUrl(supabaseUrl),
    migrationPath: MIGRATION_PATH,
    loadedEnvFiles,
    envPresence,
    checks: [],
  }

  const tableProbe = await checkTableWithServiceRole(supabaseUrl, serviceRoleKey)
  if (!tableProbe.exists) {
    report.checks.push({ name: 'table_exists', ok: false, detail: tableProbe.message })
    report.blocker = `Apply migration manually in Supabase SQL Editor: ${MIGRATION_PATH}`
    console.log(JSON.stringify(report, null, 2))
    process.exit(2)
  }

  report.checks.push({ name: 'table_exists', ok: true })
  report.checks.push({ name: 'service_role_read', ok: true })

  if (anonKey) {
    const anonResult = await checkAnonDenied(supabaseUrl, anonKey)
    report.checks.push({
      name: 'anon_denied',
      ok: anonResult.denied,
      detail: `${anonResult.mode}: ${anonResult.message}`,
    })
    assert(anonResult.denied, 'Anon client could read manual pricing draft table')
  } else {
    report.checks.push({
      name: 'anon_denied',
      ok: null,
      detail: 'Skipped: SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY not set',
    })
  }

  const migrationSql = readFileSync(MIGRATION_PATH, 'utf8')
  for (const token of [
    'enable row level security',
    'order_manual_pricing_drafts_deny_all',
    'using (false)',
    "check (status = 'draft')",
    'manual_total_price > 0',
    'order_id text not null unique',
  ]) {
    assert(migrationSql.includes(token), `Migration file missing token: ${token}`)
  }
  report.checks.push({ name: 'migration_sql_contract', ok: true })

  if (smokeBaseUrl && verifyOrderId) {
    const runtimeReady = await checkApiRuntimeReady(smokeBaseUrl, adminKey, verifyOrderId)
    report.checks.push({ name: 'api_runtime_ready', ok: runtimeReady.ok, detail: runtimeReady.detail })
    assert(runtimeReady.ok, runtimeReady.detail)

    const smoke = await runApiSmoke({
      baseUrl: smokeBaseUrl,
      adminKey,
      orderId: verifyOrderId,
      draftPrice,
      draftReason,
    })
    report.checks.push({ name: 'api_smoke', ok: true, detail: smoke })
  } else {
    report.checks.push({
      name: 'api_smoke',
      ok: null,
      detail: 'Skipped: set SMOKE_BASE_URL and LIVE_VERIFY_ORDER_ID to run API smoke',
    })
  }

  report.ok = report.checks.every((item) => item.ok !== false)
  console.log(JSON.stringify(report, null, 2))
  if (!report.ok) process.exit(1)
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        message: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  )
  process.exit(1)
})
