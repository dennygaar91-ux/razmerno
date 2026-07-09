#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, join, relative } from 'node:path'

const ROOT = process.cwd()
const D13_ROOT = join(ROOT, 'artifacts', 'visual-qa', 'd13-local')

const ORDER_COMPLETED_RZ = 'RZ-20260707-5271'
const ORDER_REVIEW_RZ = 'RZ-20260706-7048'

const STATIC_SHOT_ROUTES = {
  landing: '/',
  'measurements-info': '/measurements',
  'materials-page': '/materials',
  'assembly-page': '/assembly',
  'constructor-3d-sizes': '/configurator-3d',
  'constructor-3d-materials': '/configurator-3d',
  'constructor-webgl-fallback': '/configurator-3d?rzm_webgl=off',
  'constructor-checkout': '/configurator-3d',
  'customer-auth-gate': '/account',
  'customer-workspace': '/account',
  'operations-login': '/operations',
  'operations-workspace': '/operations',
  'operations-order-review-completed': `/operations/orders/${ORDER_COMPLETED_RZ}`,
  'operations-order-review-queue': `/operations/orders/${ORDER_REVIEW_RZ}`,
}

const SHOT_BATCH_HINTS = {
  landing: 'marketing-static',
  'measurements-info': 'marketing-static',
  'materials-page': 'marketing-static',
  'assembly-page': 'marketing-static',
  'constructor-3d-sizes': 'constructor-visual',
  'constructor-3d-materials': 'constructor-visual',
  'constructor-webgl-fallback': 'constructor-visual',
  'constructor-checkout': 'constructor-visual',
  'customer-auth-gate': 'customer-auth',
  'customer-workspace': 'customer-data',
  'customer-order-review': 'customer-order-review',
  'customer-order-completed': 'customer-order-completed',
  'operations-login': 'operations-auth',
  'operations-workspace': 'operations-data',
  'operations-order-review-completed': 'operations-data',
  'operations-order-review-queue': 'operations-data',
}

function resolveShotRoute(slug, manifest) {
  if (slug === 'customer-order-review') {
    const id = manifest?.resolvedOrderIds?.reviewUuid
    return id ? `/account/order/${id}` : '/account/order/{reviewUuid}'
  }
  if (slug === 'customer-order-completed') {
    const id = manifest?.resolvedOrderIds?.completedUuid
    return id ? `/account/order/${id}` : '/account/order/{completedUuid}'
  }
  return STATIC_SHOT_ROUTES[slug] || null
}

function resolveBatchName(manifest, slug) {
  return manifest?.captureWorkflow?.batch || SHOT_BATCH_HINTS[slug] || 'unknown'
}

function classifyStatus(capture, manifest) {
  if (capture?.ok === true) return 'PASS'
  if (capture?.ok === false) return 'BLOCKED'
  if (manifest?.preflightFailure) return 'BLOCKED'
  if (manifest?.ok === false) return 'BLOCKED'
  return 'PARTIAL'
}

function countNetworkFailures(capture, manifest) {
  const fromCapture = Array.isArray(capture?.networkErrors) ? capture.networkErrors.length : 0
  const fromManifest = Array.isArray(manifest?.consoleErrors) ? 0 : 0
  return fromCapture || fromManifest
}

function discoverManifestDirs() {
  if (!existsSync(D13_ROOT)) return []
  return readdirSync(D13_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(D13_ROOT, entry.name))
    .filter((dir) => existsSync(join(dir, 'manifest.json')))
}

function readManifest(dir) {
  const manifestPath = join(dir, 'manifest.json')
  try {
    return { manifestPath, manifest: JSON.parse(readFileSync(manifestPath, 'utf8')) }
  } catch (error) {
    return {
      manifestPath,
      manifest: {
        ok: false,
        parseError: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

function pngExists(filePath) {
  if (!filePath) return false
  const absolute = join(ROOT, filePath.replace(/\\/g, '/'))
  return existsSync(absolute) && statSync(absolute).isFile()
}

export function buildD13LocalVisualIndex(options = {}) {
  const rootDir = options.rootDir || D13_ROOT
  const generatedAt = new Date().toISOString()
  const entries = []

  const dirs = options.manifestDirs || discoverManifestDirs().map((dir) => dir.replace(/\\/g, '/'))

  for (const dir of dirs) {
    const folder = basename(dir)
    const { manifestPath, manifest } = readManifest(dir)
    const captures = Array.isArray(manifest.captures) ? manifest.captures : []
    const runtime = manifest.captureRuntime || manifest.runtime || 'unknown'
    const timestamp = manifest.generatedAt || generatedAt

    if (captures.length === 0 && manifest.preflightFailure) {
      entries.push({
        folder,
        batch: manifest.captureWorkflow?.batch || folder,
        shot: manifest.captureWorkflow?.explicit?.[0] || 'preflight',
        route: null,
        runtime,
        status: 'BLOCKED',
        pngPath: null,
        manifestPath: relative(ROOT, manifestPath).replace(/\\/g, '/'),
        consoleErrorCount: Array.isArray(manifest.consoleErrors) ? manifest.consoleErrors.length : 0,
        networkFailureCount: 0,
        failureClass: manifest.preflightFailure.failureClass || 'api-health-failed',
        timestamp,
        needsHumanReview: true,
      })
      continue
    }

    for (const capture of captures) {
      const slug = capture.slug || 'unknown'
      entries.push({
        folder,
        batch: resolveBatchName(manifest, slug),
        shot: slug,
        route: resolveShotRoute(slug, manifest),
        runtime,
        status: classifyStatus(capture, manifest),
        pngPath: capture.file ? capture.file.replace(/\\/g, '/') : null,
        pngExists: pngExists(capture.file),
        manifestPath: relative(ROOT, manifestPath).replace(/\\/g, '/'),
        consoleErrorCount: Array.isArray(capture.consoleErrors)
          ? capture.consoleErrors.length
          : Array.isArray(manifest.consoleErrors)
            ? manifest.consoleErrors.length
            : 0,
        networkFailureCount: countNetworkFailures(capture, manifest),
        failureClass: capture.failureClass || null,
        timestamp,
        needsHumanReview: true,
        viewport: capture.viewport || 'desktop-1440',
        error: capture.error || null,
      })
    }
  }

  entries.sort((a, b) => {
    const batch = a.batch.localeCompare(b.batch)
    if (batch !== 0) return batch
    return a.shot.localeCompare(b.shot)
  })

  return {
    generatedAt,
    root: relative(ROOT, rootDir).replace(/\\/g, '/'),
    shotCount: entries.length,
    passCount: entries.filter((item) => item.status === 'PASS').length,
    blockedCount: entries.filter((item) => item.status === 'BLOCKED').length,
    partialCount: entries.filter((item) => item.status === 'PARTIAL').length,
    needsHumanReview: true,
    closureClaimed: false,
    entries,
  }
}

function renderIndexMarkdown(index) {
  const lines = [
    '# D-13 Local Visual QA Index',
    '',
    `Generated: ${index.generatedAt}`,
    '',
    'This file is generated under `artifacts/` and does not close D-13.',
    '',
    `Shots indexed: ${index.shotCount} (PASS: ${index.passCount}, BLOCKED: ${index.blockedCount}, PARTIAL: ${index.partialCount})`,
    '',
    '| Batch | Shot | Route | Runtime | Status | PNG | Manifest | failureClass |',
    '|---|---|---|---|---|---|---|---|',
  ]

  for (const item of index.entries) {
    lines.push(
      `| ${item.batch} | ${item.shot} | ${item.route || '—'} | ${item.runtime} | ${item.status} | ${item.pngPath || '—'} | ${item.manifestPath} | ${item.failureClass || '—'} |`,
    )
  }

  lines.push('', '## Non-closure', '', '- needsHumanReview: true for every indexed shot', '- closureClaimed: false')
  return lines.join('\n')
}

function main() {
  const index = buildD13LocalVisualIndex()
  mkdirSync(D13_ROOT, { recursive: true })

  const jsonPath = join(D13_ROOT, 'index.json')
  const mdPath = join(D13_ROOT, 'index.md')
  writeFileSync(jsonPath, JSON.stringify(index, null, 2))
  writeFileSync(mdPath, renderIndexMarkdown(index))

  console.log(
    JSON.stringify({
      event: 'd13_local_visual_index',
      jsonPath: relative(ROOT, jsonPath).replace(/\\/g, '/'),
      mdPath: relative(ROOT, mdPath).replace(/\\/g, '/'),
      shotCount: index.shotCount,
      passCount: index.passCount,
      blockedCount: index.blockedCount,
      closureClaimed: false,
    }),
  )
}

if (process.argv[1]?.includes('d13-local-visual-qa-report.mjs')) {
  main()
}
