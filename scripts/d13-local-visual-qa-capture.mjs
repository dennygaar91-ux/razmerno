#!/usr/bin/env node

import { chromium } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { loadProjectEnvFiles, normalizeSupabaseProjectUrl } from './load-project-env.mjs'

const CONTRACT_TEST_EMAIL = 'contract-test@example.com'
const ADMIN_SESSION_KEY = 'razmerno-admin-session'

const ORDER_COMPLETED_RZ = 'RZ-20260707-5271'
const ORDER_REVIEW_RZ = 'RZ-20260706-7048'
const ORDER_COMPLETED_PUBLIC = 'RZM_0007'
const ORDER_REVIEW_PUBLIC = 'RZM_0002'

const DEFAULT_DEV_PORTS = ['3001', '3002', '3003', '3004', '3005', '3010']
const SHOT_COOLDOWN_MS = Number(process.env.D13_SHOT_COOLDOWN_MS || 1800)
const VIEWPORT_COOLDOWN_MS = Number(process.env.D13_VIEWPORT_COOLDOWN_MS || 2500)

const VIEWPORTS = process.env.D13_ALL_VIEWPORTS === '1'
  ? [
      { name: 'desktop-1440', width: 1440, height: 900 },
      { name: 'tablet-768', width: 768, height: 1024 },
      { name: 'mobile-390', width: 390, height: 844 },
    ]
  : [{ name: 'desktop-1440', width: 1440, height: 900 }]

const CUSTOMER_ORDER_DETAIL_SHOTS = ['customer-order-review', 'customer-order-completed']

const CAPTURE_BATCHES = {
  'customer-auth': ['customer-auth-gate'],
  // Workspace + notifications only. Order detail must run as isolated shots on fresh dev.
  'customer-data': ['customer-workspace'],
  'customer-workspace': ['customer-workspace'],
  'customer-order-review': ['customer-order-review'],
  'customer-order-completed': ['customer-order-completed'],
  'operations-auth': ['operations-login'],
  'operations-data': [
    'operations-workspace',
    'operations-order-review-completed',
    'operations-order-review-queue',
  ],
  'marketing-static': ['landing', 'measurements-info', 'materials-page', 'assembly-page'],
  'constructor-visual': [
    'constructor-3d-sizes',
    'constructor-webgl-fallback',
    'constructor-checkout',
  ],
  responsive: [
    'customer-auth-gate',
    'customer-workspace',
    'customer-order-review',
    'customer-order-completed',
    'operations-login',
    'operations-workspace',
    'operations-order-review-completed',
    'operations-order-review-queue',
  ],
}

const VALID_WINDOWS_D13_WORKFLOW = [
  '1. Start fresh vercel dev on port 3004 (VERCEL_DEV_PORT=3004 + scripts/start-vercel-dev-with-env.mjs).',
  '2. D13_CAPTURE_BATCH=marketing-static → landing/measurements/materials/assembly static pages.',
  '3. D13_CAPTURE_BATCH=constructor-visual → constructor 3D, WebGL fallback, checkout (one batch; restart dev if unstable).',
  '4. D13_CAPTURE_BATCH=customer-data → workspace/notifications only; then restart dev.',
  '5. D13_CAPTURE_BATCH=customer-data D13_SHOTS=customer-order-review → isolated first shot; restart dev.',
  '6. D13_CAPTURE_BATCH=customer-data D13_SHOTS=customer-order-completed → isolated first shot; restart dev.',
  '7. D13_CAPTURE_BATCH=operations-data → operations batch on fresh dev.',
]

function resolveCaptureWorkflow() {
  const batch = process.env.D13_CAPTURE_BATCH?.trim() || ''
  const explicit =
    process.env.D13_SHOTS?.split(',').map((item) => item.trim()).filter(Boolean) ?? []
  const allowMonolithic = process.env.D13_ALLOW_MONOLITHIC === '1'
  const allViewports = process.env.D13_ALL_VIEWPORTS === '1'
  const warnings = []

  if (allViewports && !allowMonolithic) {
    throw new Error(
      'D13_ALL_VIEWPORTS=1 is unreliable on Windows local vercel dev. Use batch-only workflow or set D13_ALLOW_MONOLITHIC=1 to override.',
    )
  }

  if (!batch && explicit.length === 0 && !allowMonolithic) {
    throw new Error(
      'D-13 capture requires D13_CAPTURE_BATCH or D13_SHOTS. Monolithic all-shots capture is disabled on Windows local dev. Set D13_ALLOW_MONOLITHIC=1 to override.',
    )
  }

  if (batch === 'responsive' && !allowMonolithic) {
    throw new Error(
      'D13_CAPTURE_BATCH=responsive is not valid on Windows local vercel dev without D13_ALLOW_MONOLITHIC=1. Use batch-only workflow.',
    )
  }

  if (batch === 'customer-data' && explicit.length === 0) {
    warnings.push(
      'customer-data captures workspace/notifications only. Run customer-order-review and customer-order-completed as isolated D13_SHOTS on fresh dev (restart vercel dev between shots).',
    )
  }

  if (
    explicit.some((slug) => CUSTOMER_ORDER_DETAIL_SHOTS.includes(slug)) &&
    batch === 'customer-data' &&
    explicit.length > 0
  ) {
    warnings.push(
      'Customer order detail isolated shot: use a fresh vercel dev process as the first capture in this session.',
    )
  }

  return {
    batch: batch || null,
    explicit,
    warnings,
    workflow: VALID_WINDOWS_D13_WORKFLOW,
    allowMonolithic,
  }
}

function signAdminToken(secret) {
  const payload = { sub: 'admin', role: 'admin', iat: Date.now(), exp: Date.now() + 1000 * 60 * 60 }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}

function mirrorViteSupabaseEnv() {
  const mirrors = [
    ['VITE_SUPABASE_URL', 'SUPABASE_URL'],
    ['VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'],
  ]
  for (const [viteKey, sourceKey] of mirrors) {
    if (!process.env[viteKey]?.trim() && process.env[sourceKey]?.trim()) {
      process.env[viteKey] = process.env[sourceKey].trim()
    }
  }
}

function ensureAllowedOriginsForLocalCapture(baseUrl) {
  const defaults = [
    'http://localhost:5173',
  ...DEFAULT_DEV_PORTS.map((port) => `http://localhost:${port}`),
  ]
  const current = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const merged = new Set([...defaults, ...current])
  try {
    const origin = new URL(baseUrl).origin
    merged.add(origin)
  } catch {
    // keep defaults only
  }
  process.env.ALLOWED_ORIGINS = [...merged].join(',')
}

async function getCustomerSession(supabaseUrl, serviceRoleKey, anonKey) {
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: CONTRACT_TEST_EMAIL,
  })
  if (linkError) throw new Error(linkError.message || JSON.stringify(linkError) || 'generateLink failed')

  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  })
  if (error || !data.session) {
    throw new Error(error?.message || JSON.stringify(error) || 'no customer session')
  }
  return data.session
}

function supabaseStorageKey(supabaseUrl) {
  const normalized = normalizeSupabaseProjectUrl(supabaseUrl)
  if (!normalized) throw new Error('invalid supabase url for storage key')
  const host = new URL(normalized).hostname
  const ref = host.split('.')[0]
  return `sb-${ref}-auth-token`
}

async function fetchJsonWithRetry(url, options = {}, attempts = 3) {
  let lastError = null
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, options)
      const text = await response.text()
      let payload = null
      try {
        payload = text ? JSON.parse(text) : null
      } catch {
        payload = null
      }
      if (response.status === 502 && attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt))
        continue
      }
      return { response, payload, text }
    } catch (error) {
      lastError = error
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt))
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('fetch failed')
}

async function resolveVisualQaOrderIds(baseUrl, accessToken) {
  const { response, payload } = await fetchJsonWithRetry(`${baseUrl}/api/customer/workspace`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok || payload?.ok !== true || !Array.isArray(payload.workspace?.orders)) {
    throw new Error(
      `Failed to resolve visual QA order ids from workspace: HTTP ${response.status} ${payload?.message || ''}`.trim(),
    )
  }

  const orders = payload.workspace.orders
  const byPublic = new Map(
    orders
      .filter((order) => typeof order.publicOrderNumber === 'string' && order.publicOrderNumber.trim())
      .map((order) => [order.publicOrderNumber, order]),
  )

  const reviewOrder =
    byPublic.get(ORDER_REVIEW_PUBLIC) ||
    orders.find((order) => order.status?.stage === 'review')
  const completedOrder =
    byPublic.get(ORDER_COMPLETED_PUBLIC) ||
    orders.find((order) => order.status?.stage === 'completed')

  if (!reviewOrder?.id || !completedOrder?.id) {
    throw new Error(
      `Missing safe visual QA orders in workspace. Need ${ORDER_REVIEW_PUBLIC} (${ORDER_REVIEW_RZ}) and ${ORDER_COMPLETED_PUBLIC} (${ORDER_COMPLETED_RZ}); found: ${orders.map((order) => order.publicOrderNumber).filter(Boolean).join(', ') || 'none'}`,
    )
  }

  return {
    reviewUuid: reviewOrder.id,
    completedUuid: completedOrder.id,
    reviewPublic: reviewOrder.publicOrderNumber,
    completedPublic: completedOrder.publicOrderNumber,
  }
}

async function waitForApiResponse(page, pathPart, acceptedStatuses = [200], timeout = 35_000) {
  try {
    const response = await page.waitForResponse(
      (item) => item.url().includes(pathPart) && acceptedStatuses.includes(item.status()),
      { timeout },
    )
    return response
  } catch {
    return null
  }
}

async function waitForCustomerAuthReady(page, authenticated) {
  if (!authenticated) {
    await page
      .locator('.rzm-account-panel-title', { hasText: 'Личный кабинет' })
      .first()
      .waitFor({ state: 'visible', timeout: 45_000 })
    return
  }

  await page.waitForFunction(() => {
    const text = document.body.textContent || ''
    return !text.includes('Загружаем сессию…') && !text.includes('Загружаем страницу')
  }, { timeout: 45_000 })
}

async function waitForCustomerWorkspaceReady(page) {
  await waitForCustomerAuthReady(page, true)
  await page.locator('#account-projects-title').first().waitFor({ state: 'visible', timeout: 45_000 })
  await page.locator('#account-notifications-title').first().waitFor({ state: 'visible', timeout: 45_000 })
  await page.waitForFunction(() => {
    const section = document.querySelector('#account-notifications-title')?.closest('section')
    if (!section) return false
    const text = section.textContent || ''
    return !text.includes('Загружаем уведомления')
  }, { timeout: 45_000 })
}

async function waitForCustomerOrderReady(page, statusText) {
  await waitForCustomerAuthReady(page, true)
  await page.waitForFunction(() => {
    const text = document.body.textContent || ''
    return !text.includes('Загружаем карточку заказа') && !text.includes('Загружаем страницу')
  }, { timeout: 45_000 })

  const errorPanel = page.locator('.rzm-account-panel-title').first()
  const errorPanelVisible = await errorPanel.isVisible().catch(() => false)
  if (errorPanelVisible) {
    const panelTitle = ((await errorPanel.textContent()) ?? '').trim()
    if (panelTitle === 'Заказ не найден' || panelTitle === 'Не удалось загрузить заказ') {
      throw new Error(`Customer order detail entered controlled error state: ${panelTitle}`)
    }
  }

  await page.locator('h1.rzm-account-title').first().waitFor({ state: 'visible', timeout: 45_000 })
  await page.locator('.rzm-account-order-status-label', { hasText: statusText }).first().waitFor({
    state: 'visible',
    timeout: 45_000,
  })
}

async function waitForOperationsWorkspaceReady(page) {
  await page.waitForFunction(() => {
    const body = document.body.textContent || ''
    if (body.includes('Не удалось загрузить operations workspace')) return true
    if (body.includes('Сетевая ошибка при загрузке operations workspace')) return true
    return [...document.querySelectorAll('.rzm-chip')].some((chip) =>
      (chip.textContent || '').includes('Operations API connected'),
    )
  }, { timeout: 45_000 })
  await page.locator('table tbody tr, .rzm-status[data-status="error"]').first().waitFor({
    state: 'visible',
    timeout: 45_000,
  })
}

async function waitForOperationsReviewReady(page, orderId) {
  await page
    .locator('h2', { hasText: `Review ${orderId}` })
    .or(page.locator('.rzm-status[data-status="error"]'))
    .or(page.getByText('Заявка не найдена'))
    .first()
    .waitFor({ state: 'visible', timeout: 45_000 })
}

async function waitForScreen(page, shot) {
  switch (shot.slug) {
    case 'landing':
      await page.locator('.rzm-home-main').first().waitFor({ state: 'visible', timeout: 45_000 })
      return
    case 'measurements-info':
      await page
        .locator('.rzm-info-main--measurements')
        .first()
        .waitFor({ state: 'visible', timeout: 45_000 })
      return
    case 'materials-page':
      await page.locator('.rzm-info-main--materials').first().waitFor({ state: 'visible', timeout: 45_000 })
      return
    case 'assembly-page':
      await page.locator('.rzm-info-main--assembly').first().waitFor({ state: 'visible', timeout: 45_000 })
      return
    case 'constructor-3d-sizes':
      await page.locator('.rzm-3d-page').first().waitFor({ state: 'visible', timeout: 45_000 })
      return
    case 'constructor-webgl-fallback':
      await page.locator('.rzm-3d-page').first().waitFor({ state: 'visible', timeout: 45_000 })
      await page
        .locator('.rzm-3d-blueprint-fallback')
        .first()
        .waitFor({ state: 'visible', timeout: 45_000 })
      return
    case 'constructor-checkout':
      await page.locator('.rzm-3d-page').first().waitFor({ state: 'visible', timeout: 45_000 })
      await page.locator('button:has-text("Заявка")').first().click({ timeout: 15_000 })
      await page.locator('.rzm-3d-checkout').first().waitFor({ state: 'visible', timeout: 45_000 })
      return
    case 'customer-auth-gate':
      await page
        .locator('.rzm-account-panel-title', { hasText: 'Личный кабинет' })
        .first()
        .waitFor({ state: 'visible', timeout: 45_000 })
      return
    case 'customer-workspace':
      await waitForCustomerWorkspaceReady(page)
      return
    case 'customer-order-review':
    case 'customer-order-completed':
      await waitForCustomerOrderReady(page, shot.statusText)
      return
    case 'operations-login':
      await page.locator('text=Очередь заявок').first().waitFor({ state: 'visible', timeout: 45_000 })
      return
    case 'operations-workspace':
      await waitForOperationsWorkspaceReady(page)
      return
    case 'operations-order-review-completed':
      await waitForOperationsReviewReady(page, ORDER_COMPLETED_RZ)
      return
    case 'operations-order-review-queue':
      await waitForOperationsReviewReady(page, ORDER_REVIEW_RZ)
      return
    default:
      await page.locator('body').waitFor({ state: 'visible', timeout: 45_000 })
  }
}

async function capture(page, outDir, slug, viewportName) {
  const file = join(outDir, `${slug}__${viewportName}.png`)
  await page.screenshot({ path: file, fullPage: true })
  return file
}

async function preparePageAuth(context, shot, sessionPayload, storageKey, adminToken) {
  await context.addInitScript(
    ({ key, sessionValue, adminKey, adminValue }) => {
      localStorage.clear()
      sessionStorage.clear()
      if (sessionValue) {
        localStorage.setItem(key, JSON.stringify(sessionValue))
      }
      if (adminValue) {
        sessionStorage.setItem(adminKey, adminValue)
      }
    },
    {
      key: storageKey,
      sessionValue: shot.auth ? sessionPayload : null,
      adminKey: ADMIN_SESSION_KEY,
      adminValue: shot.admin ? adminToken : null,
    },
  )
}

function filterShots(shots) {
  const batch = process.env.D13_CAPTURE_BATCH?.trim()
  const explicit = process.env.D13_SHOTS?.split(',').map((item) => item.trim()).filter(Boolean) ?? []

  let filtered = shots

  if (explicit.length > 0) {
    filtered = filtered.filter((shot) => explicit.includes(shot.slug))
  }

  if (batch) {
    const allowed = CAPTURE_BATCHES[batch]
    if (!allowed) {
      throw new Error(
        `Unknown D13_CAPTURE_BATCH=${batch}. Allowed: ${Object.keys(CAPTURE_BATCHES).join(', ')}`,
      )
    }

    if (explicit.length > 0) {
      const intersected = filtered.filter((shot) => allowed.includes(shot.slug))
      if (intersected.length > 0) {
        filtered = intersected
      } else if (
        batch === 'customer-data' &&
        filtered.length > 0 &&
        filtered.every((shot) => CUSTOMER_ORDER_DETAIL_SHOTS.includes(shot.slug))
      ) {
        // Isolated customer order detail on fresh dev (explicit override).
      } else {
        filtered = []
      }
    } else {
      filtered = filtered.filter((shot) => allowed.includes(shot.slug))
    }
  }

  return filtered
}

function buildShots(orderIds) {
  return [
    { slug: 'landing', path: '/' },
    { slug: 'measurements-info', path: '/measurements' },
    { slug: 'materials-page', path: '/materials' },
    { slug: 'assembly-page', path: '/assembly' },
    {
      slug: 'constructor-3d-sizes',
      path: '/configurator-3d',
    },
    {
      slug: 'constructor-webgl-fallback',
      path: '/configurator-3d?rzm_webgl=off',
    },
    {
      slug: 'constructor-checkout',
      path: '/configurator-3d',
      openCheckoutStep: true,
    },
    { slug: 'customer-auth-gate', path: '/account', auth: false },
    {
      slug: 'customer-workspace',
      path: '/account',
      auth: true,
      apiWait: '/api/customer/workspace',
      secondaryApiWait: '/api/customer/notifications',
    },
    {
      slug: 'customer-order-review',
      path: `/account/order/${orderIds.reviewUuid}`,
      auth: true,
      apiWait: `/api/customer/order?id=${orderIds.reviewUuid}`,
      statusText: 'На проверке',
    },
    {
      slug: 'customer-order-completed',
      path: `/account/order/${orderIds.completedUuid}`,
      auth: true,
      apiWait: `/api/customer/order?id=${orderIds.completedUuid}`,
      statusText: 'Завершено',
    },
    { slug: 'operations-login', path: '/operations', admin: false },
    {
      slug: 'operations-workspace',
      path: '/operations',
      admin: true,
      apiWait: '/api/operations/workspace',
    },
    {
      slug: 'operations-order-review-completed',
      path: `/operations/orders/${ORDER_COMPLETED_RZ}`,
      admin: true,
      apiWait: `/api/operations/order?orderId=${ORDER_COMPLETED_RZ}`,
    },
    {
      slug: 'operations-order-review-queue',
      path: `/operations/orders/${ORDER_REVIEW_RZ}`,
      admin: true,
      apiWait: `/api/operations/order?orderId=${ORDER_REVIEW_RZ}`,
    },
  ]
}

async function main() {
  loadProjectEnvFiles()
  mirrorViteSupabaseEnv()

  const defaultPort = process.env.VERCEL_DEV_PORT?.trim() || '3004'
  const baseUrl = (process.env.VISUAL_QA_BASE_URL || `http://localhost:${defaultPort}`).replace(/\/$/, '')
  ensureAllowedOriginsForLocalCapture(baseUrl)

  const smokeFallbacks = {
    RESEND_API_KEY: 're_local_smoke_placeholder_key',
    ORDER_MANAGER_EMAIL: 'manager@example.test',
    MAIL_FROM: 'Razmerno <noreply@example.test>',
  }
  for (const [key, value] of Object.entries(smokeFallbacks)) {
    if (!process.env[key]?.trim()) process.env[key] = value
  }

  const supabaseUrl = normalizeSupabaseProjectUrl(process.env.SUPABASE_URL)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const anonKey =
    process.env.SUPABASE_ANON_KEY?.trim() || process.env.VITE_SUPABASE_ANON_KEY?.trim() || ''
  const adminKey = process.env.ADMIN_API_KEY?.trim()
  const viteSupabaseUrl = normalizeSupabaseProjectUrl(
    process.env.VITE_SUPABASE_URL || supabaseUrl || '',
  )
  if (!supabaseUrl || !serviceRoleKey || !anonKey || !adminKey) {
    throw new Error('Missing SUPABASE_URL, SERVICE_ROLE, anon key, or ADMIN_API_KEY')
  }
  if (!viteSupabaseUrl) {
    throw new Error(
      'VITE_SUPABASE_URL missing — restart local runtime with scripts/start-vercel-dev-with-env.mjs after SUPABASE_* env is set',
    )
  }

  const stamp = process.env.D13_VISUAL_QA_STAMP || '2026-07-07-d13'
  const outDir = join('artifacts', 'visual-qa', 'd13-local', stamp)
  mkdirSync(outDir, { recursive: true })

  const captureWorkflow = resolveCaptureWorkflow()
  console.log(
    JSON.stringify({
      event: 'd13_capture_workflow',
      workflow: captureWorkflow.workflow,
      batch: captureWorkflow.batch,
      shots: captureWorkflow.explicit,
      warnings: captureWorkflow.warnings,
    }),
  )

  const health = await fetchJsonWithRetry(`${baseUrl}/api/health`)
  if (!health.response.ok || health.payload?.ok !== true) {
    throw new Error(`Health check failed: ${health.response.status}`)
  }

  const session = await getCustomerSession(supabaseUrl, serviceRoleKey, anonKey)
  const orderIds = await resolveVisualQaOrderIds(baseUrl, session.access_token)
  const storageKey = supabaseStorageKey(viteSupabaseUrl)
  const adminToken = signAdminToken(adminKey)
  const sessionPayload = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  }

  const report = {
    ok: true,
    baseUrl,
    allowedOrigins: process.env.ALLOWED_ORIGINS,
    resolvedOrderIds: orderIds,
    viteSupabaseConfigured: Boolean(viteSupabaseUrl && anonKey),
    outDir,
    captureWorkflow,
    captures: [],
    consoleErrors: [],
    missingStates: [
      'customer-order-detail-payment-awaiting (Ожидает оплаты) — no safe live order without mutation',
      'customer-order-detail-in-progress (В работе) — no safe live order without mutation',
      'operations-sections-mid-lifecycle — review order in Проверка used instead where applicable',
    ],
  }

  const browser = await chromium.launch({ headless: true })

  const shots = filterShots(buildShots(orderIds))
  if (shots.length === 0) {
    throw new Error('No D-13 shots selected after batch/filter configuration')
  }

  for (const viewport of VIEWPORTS) {
    for (const shot of shots) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      })
      const page = await context.newPage()

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          report.consoleErrors.push(msg.text().slice(0, 200))
        }
      })

      try {
        await preparePageAuth(context, shot, sessionPayload, storageKey, adminToken)

        const responseWaits = []
        if (shot.apiWait) {
          responseWaits.push(waitForApiResponse(page, shot.apiWait))
        }
        if (shot.secondaryApiWait) {
          responseWaits.push(waitForApiResponse(page, shot.secondaryApiWait))
        }

        await page.goto(`${baseUrl}${shot.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 45_000,
        })
        if (responseWaits.length > 0) {
          await Promise.allSettled(responseWaits)
        }

        await waitForScreen(page, shot)
        await page.waitForTimeout(600)
        const file = await capture(page, outDir, shot.slug, viewport.name)
        report.captures.push({ slug: shot.slug, viewport: viewport.name, file, ok: true })
      } catch (error) {
        report.captures.push({
          slug: shot.slug,
          viewport: viewport.name,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        })
        report.ok = false
      } finally {
        await context.close()
        await new Promise((resolve) => setTimeout(resolve, SHOT_COOLDOWN_MS))
      }
    }

    await new Promise((resolve) => setTimeout(resolve, VIEWPORT_COOLDOWN_MS))
  }

  await browser.close()

  const manifestPath = join(outDir, 'manifest.json')
  const { writeFileSync } = await import('node:fs')
  writeFileSync(manifestPath, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  if (!report.captures.some((item) => item.ok)) process.exit(1)
}

main().catch((error) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : String(error)
  console.error(JSON.stringify({ ok: false, message }))
  process.exit(1)
})
