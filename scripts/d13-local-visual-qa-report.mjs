#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, join, relative } from 'node:path'

const ROOT = process.cwd()
const D13_ROOT = join(ROOT, 'artifacts', 'visual-qa', 'd13-local')

const ORDER_COMPLETED_RZ = 'RZ-20260707-5271'
const ORDER_REVIEW_RZ = 'RZ-20260706-7048'

export const CANONICAL_D13_FOLDERS = [
  'p03a-marketing-static',
  'p03a-constructor-visual',
  'p03a-customer-data',
  'p03a-operations-data',
  'p03a-operations-auth',
  'p03b-customer-order-review',
  'p03b-customer-order-completed',
]

export const RUNTIME_BLOCKED_FAILURE_CLASSES = new Set([
  'runtime-unavailable',
  'api-health-failed',
  'network-reset',
  'dynamic-import-failed',
])

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

export function parseD13ReportArgs(argv = process.argv.slice(2)) {
  const folders = []
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--folder' && argv[index + 1]) {
      folders.push(argv[index + 1].replace(/^.*[\\/]/, ''))
      index += 1
    }
  }

  return {
    canonical: argv.includes('--canonical'),
    includeBlocked: argv.includes('--include-blocked'),
    includeHistorical: argv.includes('--include-historical'),
    folders,
  }
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

function countNetworkFailures(capture) {
  return Array.isArray(capture?.networkErrors) ? capture.networkErrors.length : 0
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

function shouldExcludeBlockedEntry(entry, includeBlocked) {
  if (includeBlocked) return false
  if (entry.status === 'BLOCKED') return true
  if (entry.failureClass && RUNTIME_BLOCKED_FAILURE_CLASSES.has(entry.failureClass)) return true
  return false
}

export function selectManifestDirs(options = {}) {
  const allDirs = discoverManifestDirs()
  const canonicalFolders =
    options.folders?.length > 0 ? options.folders : [...CANONICAL_D13_FOLDERS]
  const includeHistorical = Boolean(options.includeHistorical)
  const omittedFolders = []

  const selected = []
  for (const dir of allDirs) {
    const folder = basename(dir)
    const isCanonical = canonicalFolders.includes(folder)
    if (!isCanonical && !includeHistorical) {
      omittedFolders.push({ folder, reason: 'not-canonical-folder' })
      continue
    }
    if (!isCanonical && includeHistorical) {
      omittedFolders.push({ folder, reason: 'included-as-historical' })
    }
    selected.push(dir)
  }

  for (const folder of canonicalFolders) {
    const dir = join(D13_ROOT, folder)
    if (!existsSync(join(dir, 'manifest.json'))) {
      omittedFolders.push({ folder, reason: 'canonical-folder-missing' })
    }
  }

  return {
    manifestDirs: selected,
    sourceFolders: canonicalFolders,
    omittedFolders,
  }
}

export function buildD13LocalVisualIndex(options = {}) {
  const rootDir = options.rootDir || D13_ROOT
  const generatedAt = new Date().toISOString()
  const entries = []
  const omittedEntries = []

  const selection =
    options.manifestDirs !== undefined
      ? {
          manifestDirs: options.manifestDirs,
          sourceFolders:
            options.sourceFolders ||
            options.folders ||
            (options.canonical ? [...CANONICAL_D13_FOLDERS] : []),
          omittedFolders:
            options.omittedFolders ||
            (options.canonical
              ? (options.folders || CANONICAL_D13_FOLDERS)
                  .filter((folder) => !options.manifestDirs.some((dir) => basename(dir) === folder))
                  .map((folder) => ({ folder, reason: 'canonical-folder-missing' }))
              : []),
        }
      : selectManifestDirs(options)

  const dirs = selection.manifestDirs.map((dir) => String(dir).replace(/\\/g, '/'))

  for (const dir of dirs) {
    const folder = basename(dir)
    const { manifestPath, manifest } = readManifest(dir)
    const captures = Array.isArray(manifest.captures) ? manifest.captures : []
    const runtime = manifest.captureRuntime || manifest.runtime || 'unknown'
    const timestamp = manifest.generatedAt || generatedAt

    if (captures.length === 0 && manifest.preflightFailure) {
      const entry = {
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
      }
      if (shouldExcludeBlockedEntry(entry, options.includeBlocked)) {
        omittedEntries.push({ ...entry, omittedReason: 'blocked-runtime-artifact' })
      } else {
        entries.push(entry)
      }
      continue
    }

    for (const capture of captures) {
      const slug = capture.slug || 'unknown'
      const entry = {
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
        networkFailureCount: countNetworkFailures(capture),
        failureClass: capture.failureClass || null,
        timestamp,
        needsHumanReview: true,
        viewport: capture.viewport || 'desktop-1440',
        error: capture.error || null,
      }

      if (shouldExcludeBlockedEntry(entry, options.includeBlocked)) {
        omittedEntries.push({ ...entry, omittedReason: 'blocked-runtime-artifact' })
        continue
      }

      entries.push(entry)
    }
  }

  entries.sort((a, b) => {
    const batch = a.batch.localeCompare(b.batch)
    if (batch !== 0) return batch
    return a.shot.localeCompare(b.shot)
  })

  const index = {
    generatedAt,
    root: relative(ROOT, rootDir).replace(/\\/g, '/'),
    canonical: Boolean(options.canonical),
    sourceFolders: selection.sourceFolders,
    includedFolders: [...new Set(entries.map((item) => item.folder))],
    omittedFolderCount: selection.omittedFolders.filter((item) => item.reason !== 'included-as-historical')
      .length,
    omittedEntryCount: omittedEntries.length,
    omittedFolders: selection.omittedFolders,
    omittedEntries,
    shotCount: entries.length,
    passCount: entries.filter((item) => item.status === 'PASS').length,
    blockedCount: entries.filter((item) => item.status === 'BLOCKED').length,
    partialCount: entries.filter((item) => item.status === 'PARTIAL').length,
    needsHumanReview: true,
    closureClaimed: false,
    entries,
  }

  return index
}

export function buildCanonicalD13LocalVisualIndex(options = {}) {
  return buildD13LocalVisualIndex({
    ...options,
    canonical: true,
    includeHistorical: options.includeHistorical ?? false,
    includeBlocked: options.includeBlocked ?? false,
    folders: options.folders?.length ? options.folders : CANONICAL_D13_FOLDERS,
  })
}

function renderIndexMarkdown(index) {
  const title = index.canonical ? '# D-13 Canonical Local Visual QA Index' : '# D-13 Local Visual QA Index'
  const lines = [
    title,
    '',
    `Generated: ${index.generatedAt}`,
    '',
    'This file is generated under `artifacts/` and does not close D-13.',
    '',
  ]

  if (index.canonical) {
    lines.push(
      `Canonical mode: true`,
      `Source folders: ${index.sourceFolders.join(', ')}`,
      `Included folders: ${index.includedFolders.join(', ') || 'none'}`,
      `Omitted folders: ${index.omittedFolderCount}`,
      `Omitted blocked/historical entries: ${index.omittedEntryCount}`,
      '',
    )
  }

  lines.push(
    `Shots indexed: ${index.shotCount} (PASS: ${index.passCount}, BLOCKED: ${index.blockedCount}, PARTIAL: ${index.partialCount})`,
    '',
    '| Batch | Shot | Route | Runtime | Status | PNG | Manifest | failureClass |',
    '|---|---|---|---|---|---|---|---|',
  )

  for (const item of index.entries) {
    lines.push(
      `| ${item.batch} | ${item.shot} | ${item.route || '—'} | ${item.runtime} | ${item.status} | ${item.pngPath || '—'} | ${item.manifestPath} | ${item.failureClass || '—'} |`,
    )
  }

  lines.push('', '## Non-closure', '', '- needsHumanReview: true for every indexed shot', '- closureClaimed: false')
  return lines.join('\n')
}

export function writeD13IndexArtifacts(index, options = {}) {
  mkdirSync(D13_ROOT, { recursive: true })
  const canonical = options.canonical ?? index.canonical
  const jsonName = canonical ? 'index.canonical.json' : 'index.json'
  const mdName = canonical ? 'index.canonical.md' : 'index.md'
  const jsonPath = join(D13_ROOT, jsonName)
  const mdPath = join(D13_ROOT, mdName)
  writeFileSync(jsonPath, JSON.stringify(index, null, 2))
  writeFileSync(mdPath, renderIndexMarkdown(index))
  return {
    jsonPath: relative(ROOT, jsonPath).replace(/\\/g, '/'),
    mdPath: relative(ROOT, mdPath).replace(/\\/g, '/'),
  }
}

function main() {
  const args = parseD13ReportArgs()
  const index = args.canonical
    ? buildCanonicalD13LocalVisualIndex({
        includeBlocked: args.includeBlocked,
        includeHistorical: args.includeHistorical,
        folders: args.folders,
      })
    : buildD13LocalVisualIndex({
        includeBlocked: true,
        includeHistorical: true,
        folders: args.folders,
      })

  const paths = writeD13IndexArtifacts(index, { canonical: args.canonical })

  console.log(
    JSON.stringify({
      event: args.canonical ? 'd13_local_visual_index_canonical' : 'd13_local_visual_index',
      ...paths,
      canonical: Boolean(args.canonical),
      shotCount: index.shotCount,
      passCount: index.passCount,
      blockedCount: index.blockedCount,
      omittedFolderCount: index.omittedFolderCount,
      omittedEntryCount: index.omittedEntryCount,
      closureClaimed: false,
    }),
  )
}

if (process.argv[1]?.includes('d13-local-visual-qa-report.mjs')) {
  main()
}
