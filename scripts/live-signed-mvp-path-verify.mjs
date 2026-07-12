#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { getEnvPresenceReport, loadProjectEnvFiles, normalizeSupabaseProjectUrl } from './load-project-env.mjs'

const CONTRACT_TEST_EMAIL = 'contract-test@example.com'
const ORDER_SUBMIT_TEST_AUTH_TOKEN = 'rzm-contract-test-order-auth-token'

const REQUIRED_ENV = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_API_KEY',
  'SMOKE_BASE_URL',
]

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function signAdminToken(secret) {
  const payload = { sub: 'admin', role: 'admin', iat: Date.now(), exp: Date.now() + 1000 * 60 * 60 }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}

function makeOrderId() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `RZ-${yyyy}${mm}${dd}-${rand}`
}

function makeD12OrderPayload(orderId) {
  return {
    orderId,
    productType: 'wardrobe',
    dimensions: { width: 1800, height: 2200, depth: 600 },
    sections: 2,
    filling: { shelves: 4, drawers: 0, hangingRod: true },
    layout: {
      sections: [
        {
          id: 'section-1',
          widthMm: 900,
          compartments: [
            { id: 'section-1-zone-1', kind: 'rod', heightMm: 2200, shelves: 0, drawers: 0, hasRod: true },
          ],
        },
        {
          id: 'section-2',
          widthMm: 900,
          compartments: [
            { id: 'section-2-zone-1', kind: 'shelves', heightMm: 2200, shelves: 4, drawers: 0, hasRod: false },
          ],
        },
      ],
    },
    materials: {
      bodyId: 'white-matt',
      facadeId: 'white-matt',
      facadeKind: 'ldsp',
      backPanelId: 'white-matt',
      backPanelKind: 'hdf',
    },
    style: { facadeStyleId: 'regular', hardwareId: 'base' },
    priceBreakdown: {
      body: 32000,
      facades: 24000,
      filling: 8000,
      hardware: 3800,
      production: 0,
      materials: 56000,
      edgeBanding: 4500,
      services: 7500,
      delivery: 0,
      assembly: 0,
    },
    totalPrice: 79800,
    customer: {
      name: 'D12 Live Test',
      phone: '+7 900 000-00-99',
      email: 'd12-live-test@example.com',
      comment: 'D-12 signed MVP live verification safe test order',
    },
    delivery: { enabled: false, price: 0 },
    assembly: { enabled: false, price: 0, rate: 0, basePrice: 0 },
    consent: { personalData: true, privacyVersion: '2026-05-24', acceptedAt: new Date().toISOString() },
    configVersion: 'd12-live-verify',
    source: 'd12-live-verify-script',
    utm: {},
    honeypot: '',
  }
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

async function getCustomerAccessToken(supabaseUrl, serviceRoleKey, anonKey) {
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: CONTRACT_TEST_EMAIL,
  })
  if (linkError) throw new Error(`generateLink failed: ${linkError.message}`)

  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: sessionData, error: sessionError } = await client.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  })
  if (sessionError) throw new Error(`verifyOtp failed: ${sessionError.message}`)
  assert(sessionData.session?.access_token, 'No access token from verifyOtp')
  return sessionData.session.access_token
}

async function checkHealth(baseUrl) {
  const health = await requestJson(baseUrl, '/api/health')
  const checks = Array.isArray(health.json?.checks) ? health.json.checks : []
  const supabaseChecks = checks.filter((c) => typeof c?.name === 'string' && c.name.includes('SUPABASE'))
  const supabaseOk = supabaseChecks.every((c) => c.present === true)
  return { health, supabaseOk, supabaseChecks }
}

async function resolveOrderUuid(supabaseUrl, serviceRoleKey, businessOrderId) {
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await admin
    .from('orders')
    .select('id')
    .eq('order_id', businessOrderId)
    .maybeSingle()
  if (error) throw new Error(`resolveOrderUuid failed: ${error.message}`)
  assert(data?.id, `Order UUID not found for ${businessOrderId}`)
  return data.id
}

async function main() {
  const loaded = loadProjectEnvFiles()
  const presence = getEnvPresenceReport(REQUIRED_ENV)
  const missing = presence.filter((p) => !p.present).map((p) => p.name)
  if (missing.length > 0) {
    console.log(JSON.stringify({ ok: false, blocker: 'missing_env', missing, loaded }, null, 2))
    process.exit(2)
  }

  const baseUrl = process.env.SMOKE_BASE_URL.trim()
  const adminKey = process.env.ADMIN_API_KEY.trim()
  const supabaseUrl = normalizeSupabaseProjectUrl(process.env.SUPABASE_URL)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
  const anonKey =
    process.env.SUPABASE_ANON_KEY?.trim() || process.env.VITE_SUPABASE_ANON_KEY?.trim() || ''
  assert(anonKey, 'SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY required for customer JWT')

  const report = {
    ok: false,
    runtime: baseUrl,
    supabaseHost: supabaseUrl,
    loadedEnvFiles: loaded,
    steps: [],
    orderId: null,
    publicOrderNumber: null,
  }

  const push = (name, ok, detail) => report.steps.push({ name, ok, detail })

  const healthResult = await checkHealth(baseUrl)
  push('health', healthResult.supabaseOk, {
    status: healthResult.health.status,
    supabaseChecks: healthResult.supabaseChecks,
  })
  assert(healthResult.supabaseOk, 'Supabase env not present in /api/health')

  const customerToken = await getCustomerAccessToken(supabaseUrl, serviceRoleKey, anonKey)
  push('customer_jwt', true, { mode: 'contract-test magiclink' })

  const adminToken = signAdminToken(adminKey)
  const adminAuth = { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' }
  const customerAuth = { Authorization: `Bearer ${customerToken}`, 'Content-Type': 'application/json' }
  const submitAuth = { Authorization: `Bearer ${ORDER_SUBMIT_TEST_AUTH_TOKEN}`, 'Content-Type': 'application/json' }

  const orderId = makeOrderId()
  const orderPayload = makeD12OrderPayload(orderId)

  const submit = await requestJson(baseUrl, '/api/orders', {
    method: 'POST',
    headers: { ...submitAuth, 'Idempotency-Key': orderId, origin: 'http://localhost:5173' },
    body: JSON.stringify(orderPayload),
  })
  push('C1_order_submit', submit.status === 200 && submit.json?.orderId, {
    status: submit.status,
    orderId: submit.json?.orderId,
    publicOrderNumber: submit.json?.publicOrderNumber,
    message: submit.json?.message,
  })
  assert(submit.status === 200 && submit.json?.orderId, `Order submit failed: ${submit.status}`)
  report.orderId = submit.json.orderId
  report.publicOrderNumber = submit.json.publicOrderNumber ?? null

  const businessOrderId = report.orderId
  const orderUuid = await resolveOrderUuid(supabaseUrl, serviceRoleKey, businessOrderId)
  report.orderUuid = orderUuid

  const detail = await requestJson(
    baseUrl,
    `/api/customer/order?id=${encodeURIComponent(orderUuid)}`,
    { headers: customerAuth },
  )
  const customerOrder = detail.json?.order
  push('C2_customer_detail', detail.status === 200 && customerOrder?.status?.label === 'На проверке', {
    status: detail.status,
    statusLabel: customerOrder?.status?.label,
    statusStage: customerOrder?.status?.stage,
  })
  assert(detail.status === 200, `Customer detail failed: ${detail.status}`)
  assert(customerOrder?.status?.stage === 'review', `Expected review stage, got ${customerOrder?.status?.stage}`)

  push('C3_status_timeline', customerOrder?.status?.stage === 'review', {
    currentLabel: customerOrder?.status?.label,
    currentStage: customerOrder?.status?.stage,
    note: 'Full ladder verified across lifecycle steps below',
  })

  const notifBefore = await requestJson(baseUrl, '/api/customer/notifications', { headers: customerAuth })
  const unreadBefore = await requestJson(baseUrl, '/api/customer/notifications/unread-count', {
    headers: customerAuth,
  })
  push('C4_notifications_initial', notifBefore.status === 200 && unreadBefore.status === 200, {
    count: notifBefore.json?.notifications?.length,
    unread: unreadBefore.json?.unreadCount,
  })

  const cr = await requestJson(baseUrl, '/api/customer/change-request', {
    method: 'POST',
    headers: customerAuth,
    body: JSON.stringify({
      orderId: orderUuid,
      requestType: 'configuration',
      message: 'D-12 live verification change request safe test',
    }),
  })
  push('C5_change_request', cr.status === 200 && cr.json?.changeRequest?.id, {
    status: cr.status,
    changeRequestId: cr.json?.changeRequest?.id,
  })
  assert(cr.status === 200, `Change request failed: ${cr.status}`)
  const changeRequestId = cr.json.changeRequest.id

  const workspace = await requestJson(baseUrl, '/api/operations/workspace', { headers: adminAuth })
  const inQueue = workspace.json?.orders?.some((o) => o.orderId === businessOrderId)
  push('O1_workspace', workspace.status === 200, {
    status: workspace.status,
    inQueue,
    orderCount: workspace.json?.orders?.length,
  })

  const review0 = await requestJson(
    baseUrl,
    `/api/operations/order?orderId=${encodeURIComponent(businessOrderId)}`,
    { headers: adminAuth },
  )
  push('O2_order_review', review0.status === 200 && review0.json?.review?.orderId === businessOrderId, {
    status: review0.status,
    domainStatus: review0.json?.review?.domainStatus,
    canDecide: review0.json?.review?.decisionEligibility?.canDecide,
  })

  const draftPrice = 125000
  const draft = await requestJson(baseUrl, '/api/operations/manual-pricing-draft', {
    method: 'POST',
    headers: adminAuth,
    body: JSON.stringify({
      orderId: businessOrderId,
      manualTotalPrice: draftPrice,
      reason: 'D-12 live verification manual pricing draft',
    }),
  })
  push('O3_manual_pricing_draft', draft.status === 200 && draft.json?.manualPricingDraft?.manualTotalPrice === draftPrice, {
    status: draft.status,
    draftPrice: draft.json?.manualPricingDraft?.manualTotalPrice,
  })

  const crDecision = await requestJson(baseUrl, '/api/operations/change-request-decision', {
    method: 'POST',
    headers: adminAuth,
    body: JSON.stringify({ changeRequestId, decision: 'reviewed' }),
  })
  push('O4_change_request_decision', crDecision.status === 200, {
    status: crDecision.status,
    decision: crDecision.json?.changeRequest?.status,
  })

  const approve = await requestJson(baseUrl, '/api/operations/order-decision', {
    method: 'POST',
    headers: adminAuth,
    body: JSON.stringify({ orderId: report.orderId, decision: 'approve' }),
  })
  push('O5_approve', approve.status === 200 && approve.json?.decision?.domainStatus === 'Оплата', {
    status: approve.status,
    domainStatus: approve.json?.decision?.domainStatus,
  })
  assert(approve.status === 200, `Approve failed: ${approve.status}`)

  const detailAfterApprove = await requestJson(
    baseUrl,
    `/api/customer/order?id=${encodeURIComponent(orderUuid)}`,
    { headers: customerAuth },
  )
  const afterApproveOrder = detailAfterApprove.json?.order
  push('C6_payment_instructions', afterApproveOrder?.status?.label === 'Ожидает оплаты', {
    statusLabel: afterApproveOrder?.status?.label,
    paymentState: afterApproveOrder?.paymentState,
    paymentInstructionsVisible: afterApproveOrder?.paymentState === 'awaiting_manual_confirmation',
  })

  const payConfirm = await requestJson(baseUrl, '/api/operations/payment-confirmation', {
    method: 'POST',
    headers: adminAuth,
    body: JSON.stringify({ orderId: report.orderId, note: 'D-12 manual payment confirmation' }),
  })
  push('O7_payment_confirmation', payConfirm.status === 200 && payConfirm.json?.confirmation?.domainStatus === 'В работе', {
    status: payConfirm.status,
    domainStatus: payConfirm.json?.confirmation?.domainStatus,
  })
  assert(payConfirm.status === 200, `Payment confirmation failed: ${payConfirm.status}`)

  const complete = await requestJson(baseUrl, '/api/operations/order-completion', {
    method: 'POST',
    headers: adminAuth,
    body: JSON.stringify({ orderId: report.orderId, note: 'D-12 order completion' }),
  })
  push('O8_order_completion', complete.status === 200 && complete.json?.completion?.domainStatus === 'Завершено', {
    status: complete.status,
    domainStatus: complete.json?.completion?.domainStatus,
  })
  assert(complete.status === 200, `Order completion failed: ${complete.status}`)

  const reviewFinal = await requestJson(
    baseUrl,
    `/api/operations/order?orderId=${encodeURIComponent(businessOrderId)}`,
    { headers: adminAuth },
  )
  const history = reviewFinal.json?.review?.decisionHistory
  push('O9_decision_history', Array.isArray(history) && history.length >= 1, {
    events: history?.length,
    hasReasonField: history?.every((e) => 'reason' in e),
    changedBySample: history?.map((e) => e.changedBy),
  })

  const detailFinal = await requestJson(
    baseUrl,
    `/api/customer/order?id=${encodeURIComponent(orderUuid)}`,
    { headers: customerAuth },
  )
  push('C9_completion_visibility', detailFinal.json?.order?.status?.label === 'Завершено', {
    statusLabel: detailFinal.json?.order?.status?.label,
    statusStage: detailFinal.json?.order?.status?.stage,
  })

  const notifAfter = await requestJson(baseUrl, '/api/customer/notifications', { headers: customerAuth })
  const unreadAfter = await requestJson(baseUrl, '/api/customer/notifications/unread-count', {
    headers: customerAuth,
  })
  const notifications = notifAfter.json?.notifications ?? []
  const unreadCount = unreadAfter.json?.unreadCount ?? 0
  push('notifications_list', notifAfter.status === 200 && notifications.length > 0, {
    count: notifications.length,
    unread: unreadCount,
  })

  const unreadId = notifications.find((n) => !n.isRead)?.id
  if (unreadId) {
    const markRead = await requestJson(baseUrl, '/api/customer/notification/read', {
      method: 'PATCH',
      headers: customerAuth,
      body: JSON.stringify({ notificationId: unreadId }),
    })
    const unreadAfterRead = await requestJson(baseUrl, '/api/customer/notifications/unread-count', {
      headers: customerAuth,
    })
    push('mark_read', markRead.status === 200, {
      status: markRead.status,
      unreadBefore: unreadCount,
      unreadAfter: unreadAfterRead.json?.unreadCount,
    })
  } else {
    push('mark_read', null, { skipped: 'no unread notification' })
  }

  const customerNoAuth = await requestJson(
    baseUrl,
    `/api/customer/order?id=${encodeURIComponent(orderUuid)}`,
  )
  push('S1_customer_unauth', customerNoAuth.status === 401, { status: customerNoAuth.status })

  const opsNoAuth = await requestJson(baseUrl, '/api/operations/workspace')
  push('S2_ops_unauth', opsNoAuth.status === 401, { status: opsNoAuth.status })

  const opsWrongAuth = await requestJson(baseUrl, '/api/operations/workspace', {
    headers: { Authorization: 'Bearer wrong-key', 'Content-Type': 'application/json' },
  })
  push('S3_ops_wrong_auth', opsWrongAuth.status === 401, { status: opsWrongAuth.status })

  const customerLeak = JSON.stringify(detailFinal.json ?? {})
  const forbiddenLeak = ['changed_by', 'production_export', 'decisionHistory'].some((k) =>
    customerLeak.includes(k),
  )
  push('S4_customer_no_audit_leak', !forbiddenLeak, { forbiddenLeak })

  report.ok = report.steps.every((s) => s.ok !== false)
  const outPath = process.env.D12_LIVE_REPORT_PATH || 'artifacts/d12-live-verification-report.json'
  try {
    writeFileSync(outPath, JSON.stringify(report, null, 2))
    report.reportPath = outPath
  } catch {
    // artifacts dir may not exist
  }

  console.log(JSON.stringify(report, null, 2))
  if (!report.ok) process.exit(1)
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, message: error instanceof Error ? error.message : String(error) }, null, 2))
  process.exit(1)
})
