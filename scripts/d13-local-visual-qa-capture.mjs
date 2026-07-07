#!/usr/bin/env node

import { chromium } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { loadProjectEnvFiles, normalizeSupabaseProjectUrl } from './load-project-env.mjs'

const CONTRACT_TEST_EMAIL = 'contract-test@example.com'
const ADMIN_SESSION_KEY = 'razmerno-admin-session'

const ORDER_REVIEW_UUID = '99fddb29-4129-4dc6-8af0-45de50a1009d'
const ORDER_COMPLETED_UUID = '62242cd0-f9b4-4b11-8003-bc9c368e8983'
const ORDER_COMPLETED_RZ = 'RZ-20260707-5271'
const ORDER_REVIEW_RZ = 'RZ-20260706-7048'

const VIEWPORTS = process.env.D13_ALL_VIEWPORTS === '1'
  ? [
      { name: 'desktop-1440', width: 1440, height: 900 },
      { name: 'tablet-768', width: 768, height: 1024 },
      { name: 'mobile-390', width: 390, height: 844 },
    ]
  : [{ name: 'desktop-1440', width: 1440, height: 900 }]

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

async function tryWaitForApiResponse(page, pathPart, timeout = 25_000) {
  try {
    await page.waitForResponse(
      (response) => response.url().includes(pathPart) && response.status() === 200,
      { timeout },
    )
  } catch {
    // DOM selectors remain the primary readiness signal for local visual QA.
  }
}

async function waitForScreen(page, shot) {
  const waits = {
    'customer-auth-gate': () => page.locator('.rzm-account-panel-title', { hasText: 'Личный кабинет' }),
    'customer-workspace': () => page.locator('#account-projects-title'),
    'customer-order-review': () => page.locator('h1.rzm-account-title, .rzm-account-panel-title').first(),
    'customer-order-completed': () => page.locator('h1.rzm-account-title, .rzm-account-panel-title').first(),
    'operations-login': () => page.locator('text=Очередь заявок'),
    'operations-workspace': () => page.locator('table tbody tr').first(),
    'operations-order-review-completed': () =>
      page.locator('h2', { hasText: `Review ${ORDER_COMPLETED_RZ}` }),
    'operations-order-review-queue': () =>
      page.locator('h2', { hasText: `Review ${ORDER_REVIEW_RZ}` }),
  }
  const locator = waits[shot.slug]?.() ?? page.locator('body')
  await locator.first().waitFor({ state: 'visible', timeout: 45_000 })
}

async function capture(page, outDir, slug, viewportName) {
  const file = join(outDir, `${slug}__${viewportName}.png`)
  await page.screenshot({ path: file, fullPage: true })
  return file
}

async function preparePageAuth(page, baseUrl, shot, sessionPayload, storageKey, adminToken) {
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  if (shot.auth) {
    await page.evaluate(
      ({ key, value }) => {
        localStorage.setItem(key, JSON.stringify(value))
      },
      { key: storageKey, value: sessionPayload },
    )
  }

  if (shot.admin) {
    await page.evaluate(
      ({ key, token }) => {
        sessionStorage.setItem(key, token)
      },
      { key: ADMIN_SESSION_KEY, token: adminToken },
    )
  }
}

async function main() {
  loadProjectEnvFiles()
  mirrorViteSupabaseEnv()

  const smokeFallbacks = {
    ALLOWED_ORIGINS: 'http://localhost:5173,http://localhost:3005',
    RESEND_API_KEY: 're_local_smoke_placeholder_key',
    ORDER_MANAGER_EMAIL: 'manager@example.test',
    MAIL_FROM: 'Razmerno <noreply@example.test>',
  }
  for (const [key, value] of Object.entries(smokeFallbacks)) {
    if (!process.env[key]?.trim()) process.env[key] = value
  }

  const baseUrl = (process.env.VISUAL_QA_BASE_URL || 'http://localhost:3005').replace(/\/$/, '')
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

  const health = await fetch(`${baseUrl}/api/health`)
  const healthText = await health.text()
  let healthJson = null
  try {
    healthJson = healthText ? JSON.parse(healthText) : null
  } catch {
    throw new Error(`Health check returned non-JSON (${health.status}): ${healthText.slice(0, 120)}`)
  }
  if (!health.ok || healthJson?.ok !== true) {
    throw new Error(`Health check failed: ${health.status}`)
  }

  const session = await getCustomerSession(supabaseUrl, serviceRoleKey, anonKey)
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
    viteSupabaseConfigured: Boolean(viteSupabaseUrl && anonKey),
    outDir,
    captures: [],
    consoleErrors: [],
    missingStates: [
      'customer-order-detail-payment-awaiting (Ожидает оплаты) — no safe live order without mutation',
      'customer-order-detail-in-progress (В работе) — no safe live order without mutation',
      'operations-sections-mid-lifecycle — review order in Проверка used instead where applicable',
    ],
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      report.consoleErrors.push(msg.text().slice(0, 200))
    }
  })

  const shots = [
    { slug: 'customer-auth-gate', path: '/account', auth: false },
    { slug: 'customer-workspace', path: '/account', auth: true, apiWait: '/api/customer/workspace' },
    {
      slug: 'customer-order-review',
      path: `/account/order/${ORDER_REVIEW_UUID}`,
      auth: true,
      apiWait: `/api/customer/order?id=${ORDER_REVIEW_UUID}`,
      statusText: 'На проверке',
    },
    {
      slug: 'customer-order-completed',
      path: `/account/order/${ORDER_COMPLETED_UUID}`,
      auth: true,
      apiWait: `/api/customer/order?id=${ORDER_COMPLETED_UUID}`,
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

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })

    for (const shot of shots) {
      try {
        await context.clearCookies()
        await preparePageAuth(page, baseUrl, shot, sessionPayload, storageKey, adminToken)

        const responseWait = shot.apiWait ? tryWaitForApiResponse(page, shot.apiWait) : null

        await page.goto(`${baseUrl}${shot.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 45_000,
        })
        if (responseWait) {
          await responseWait
        }

        await waitForScreen(page, shot)
        if (shot.statusText) {
          await page.locator(`text=${shot.statusText}`).first().waitFor({
            state: 'visible',
            timeout: 30_000,
          })
        }
        await page.waitForTimeout(600)
        const file = await capture(page, outDir, shot.slug, viewport.name)
        report.captures.push({ slug: shot.slug, viewport: viewport.name, file, ok: true })
        await page.waitForTimeout(1200)
      } catch (error) {
        report.captures.push({
          slug: shot.slug,
          viewport: viewport.name,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        })
        report.ok = false
      }
    }
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
