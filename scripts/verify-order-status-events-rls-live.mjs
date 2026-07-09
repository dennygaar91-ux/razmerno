#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  buildSupabaseRestUrl,
  getEnvPresenceReport,
  loadProjectEnvFiles,
  normalizeSupabaseProjectUrl,
} from './load-project-env.mjs'

export const TARGET_TABLE = 'public.order_status_events'
export const REST_PATH = '/rest/v1/order_status_events?select=id&limit=1'
export const ARTIFACT_JSON = 'order-status-events-rls-live-probe.json'
export const ARTIFACT_MD = 'order-status-events-rls-live-probe.md'

export const REQUIRED_ENV_KEYS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

export function parseOrderStatusEventsRlsLiveProbeArgs(argv = process.argv.slice(2)) {
  return {
    outputDir: resolve('artifacts/live'),
    writeArtifacts: !argv.includes('--no-artifacts'),
  }
}

export function buildOrderStatusEventsRlsProbeUrl(supabaseUrl) {
  return buildSupabaseRestUrl(supabaseUrl, REST_PATH)
}

export function classifyAnonRlsProbeResult(statusCode, body) {
  const bodyText = String(body ?? '').trim()
  if (statusCode >= 400) {
    return { rlsPass: true, readable: false, mode: 'denied-or-error' }
  }
  if (bodyText === '[]') {
    return { rlsPass: true, readable: false, mode: 'empty-array' }
  }
  if (bodyText.startsWith('[') && bodyText !== '[]') {
    return { rlsPass: false, readable: true, mode: 'rows-visible' }
  }
  return { rlsPass: false, readable: false, mode: 'unexpected-body' }
}

export function classifyServiceRoleRlsProbeResult(statusCode) {
  return {
    servicePass: statusCode === 200,
    readable: statusCode === 200,
    mode: statusCode === 200 ? 'readable' : 'denied-or-error',
  }
}

export function deriveRlsLiveProbeVerificationStatus(anonResult, serviceResult) {
  if (anonResult.rlsPass && serviceResult.servicePass) return 'PASS'
  if (anonResult.rlsPass || serviceResult.servicePass) return 'PARTIAL'
  return 'FAIL'
}

export async function probeOrderStatusEventsRlsLive(options = {}) {
  const fetchFn = options.fetch || globalThis.fetch
  const env = options.env || process.env
  const supabaseUrl = normalizeSupabaseProjectUrl(env.SUPABASE_URL)
  const anonKey = env.SUPABASE_ANON_KEY?.trim()
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  const endpoint = buildOrderStatusEventsRlsProbeUrl(env.SUPABASE_URL)

  const missing = REQUIRED_ENV_KEYS.filter((name) => !env[name]?.trim())
  if (!supabaseUrl || !endpoint || !anonKey || !serviceKey || missing.length > 0) {
    return {
      ok: false,
      reason: 'missing-required-env',
      missing,
      envPresence: getEnvPresenceReport(REQUIRED_ENV_KEYS).map((item) => ({
        name: item.name,
        present: item.present,
      })),
    }
  }

  async function request(role, key) {
    const response = await fetchFn(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    })
    const body = await response.text()
    return { role, statusCode: response.status, body }
  }

  const anonResponse = await request('anon', anonKey)
  const serviceResponse = await request('service_role', serviceKey)
  const anon = classifyAnonRlsProbeResult(anonResponse.statusCode, anonResponse.body)
  const service = classifyServiceRoleRlsProbeResult(serviceResponse.statusCode)

  return {
    ok: true,
    targetTable: TARGET_TABLE,
    readOnlyProbe: true,
    liveMutationPerformed: false,
    closureClaimed: false,
    supabaseUrlNormalized: true,
    normalizedProjectRoot: supabaseUrl,
    probeEndpointPath: REST_PATH,
    anon: {
      statusCode: anonResponse.statusCode,
      bodyShape: anon.mode,
      readable: anon.readable,
      rlsPass: anon.rlsPass,
    },
    serviceRole: {
      statusCode: serviceResponse.statusCode,
      bodyShape: service.mode,
      readable: service.readable,
      servicePass: service.servicePass,
    },
    verificationStatus: deriveRlsLiveProbeVerificationStatus(anon, service),
    envPresence: getEnvPresenceReport(REQUIRED_ENV_KEYS).map((item) => ({
      name: item.name,
      present: item.present,
    })),
  }
}

export function renderOrderStatusEventsRlsLiveProbeMarkdown(result) {
  return [
    '# order_status_events RLS Live Read-only Probe',
    '',
    `Generated: ${result.generatedAt}`,
    '',
    '## Summary',
    `- targetTable: ${result.targetTable}`,
    `- readOnlyProbe: ${result.readOnlyProbe}`,
    `- liveMutationPerformed: ${result.liveMutationPerformed}`,
    `- verificationStatus: ${result.verificationStatus}`,
    `- closureClaimed: ${result.closureClaimed}`,
    '',
    '## Anon Probe',
    `- statusCode: ${result.anon?.statusCode}`,
    `- bodyShape: ${result.anon?.bodyShape}`,
    `- rlsPass: ${result.anon?.rlsPass}`,
    '',
    '## Service Role Probe',
    `- statusCode: ${result.serviceRole?.statusCode}`,
    `- servicePass: ${result.serviceRole?.servicePass}`,
    '',
    'Read-only probe only. No deploy, push, PR, merge, or closure claimed.',
  ].join('\n')
}

export function writeOrderStatusEventsRlsLiveProbeArtifacts(result, outputDir = resolve('artifacts/live')) {
  mkdirSync(outputDir, { recursive: true })
  const jsonPath = resolve(outputDir, ARTIFACT_JSON)
  const mdPath = resolve(outputDir, ARTIFACT_MD)
  writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  writeFileSync(mdPath, `${renderOrderStatusEventsRlsLiveProbeMarkdown(result)}\n`, 'utf8')
  return { jsonPath, mdPath }
}

async function main() {
  const args = parseOrderStatusEventsRlsLiveProbeArgs()
  loadProjectEnvFiles()

  const probe = await probeOrderStatusEventsRlsLive()
  if (!probe.ok) {
    const failure = {
      generatedAt: new Date().toISOString(),
      readOnlyProbe: true,
      liveMutationPerformed: false,
      closureClaimed: false,
      verificationStatus: 'FAIL',
      reason: probe.reason,
      missing: probe.missing,
      envPresence: probe.envPresence,
    }
    if (args.writeArtifacts) writeOrderStatusEventsRlsLiveProbeArtifacts(failure, args.outputDir)
    console.log(JSON.stringify({ event: 'order_status_events_rls_live_probe_failed', ...failure }, null, 2))
    process.exit(1)
  }

  const result = {
    generatedAt: new Date().toISOString(),
    ...probe,
  }

  const paths = args.writeArtifacts
    ? writeOrderStatusEventsRlsLiveProbeArtifacts(result, args.outputDir)
    : null

  console.log(JSON.stringify({ event: 'order_status_events_rls_live_probe', paths, ...result }, null, 2))
  process.exit(result.verificationStatus === 'PASS' ? 0 : 1)
}

if (process.argv[1]?.includes('verify-order-status-events-rls-live.mjs')) {
  void main()
}
