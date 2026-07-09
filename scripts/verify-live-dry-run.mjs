#!/usr/bin/env node

import {
  getEnvPresenceReport,
  loadProjectEnvFiles,
  normalizeSupabaseProjectUrl,
} from './load-project-env.mjs'

export const REQUIRED_ENV_KEYS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_API_KEY',
  'SMOKE_BASE_URL',
]

export const OPTIONAL_ENV_KEYS = [
  'SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'ORDER_MANAGER_EMAIL',
  'MAIL_FROM',
  'RESEND_API_KEY',
]

export const SAFE_RECIPIENT_PATTERNS = [
  /@example\.test$/i,
  /contract-test@example\.com/i,
  /d12-live-test@example\.com/i,
  /manager@example\.test/i,
]

export const MUTATION_STEPS = [
  {
    id: 'order-submit-live',
    requiresFlag: '--allow-mutation',
    description: 'Live order submit verification',
  },
  {
    id: 'manual-pricing-live',
    requiresFlag: '--allow-manual-pricing-live',
    description: 'Live manual pricing draft verification',
  },
  {
    id: 'rls-live-probe',
    requiresFlag: '--allow-live-rls-probe',
    description: 'Live order_status_events RLS probe',
  },
]

export function parseLiveDryRunArgs(argv = process.argv.slice(2)) {
  return {
    allowMutation: argv.includes('--allow-mutation'),
    allowManualPricingLive: argv.includes('--allow-manual-pricing-live'),
    allowLiveRlsProbe: argv.includes('--allow-live-rls-probe'),
    baseUrl: process.env.SMOKE_BASE_URL?.trim() || null,
  }
}

export function validateSupabaseUrlShape(url) {
  const normalized = normalizeSupabaseProjectUrl(url)
  if (!normalized) return { ok: false, reason: 'missing-or-invalid' }
  try {
    const parsed = new URL(normalized)
    if (!parsed.hostname.includes('supabase')) {
      return { ok: false, reason: 'unexpected-host' }
    }
    return { ok: true, host: parsed.host }
  } catch {
    return { ok: false, reason: 'parse-failed' }
  }
}

export function validateHealthPayload(payload) {
  if (!payload || typeof payload !== 'object') return { ok: false, reason: 'not-object' }
  const record = payload
  if (record.ok !== true && record.ok !== false) return { ok: false, reason: 'missing-ok' }
  if (record.service !== 'razmerno-api') return { ok: false, reason: 'missing-service' }
  if (!Array.isArray(record.missing)) return { ok: false, reason: 'missing-array' }
  if (!Array.isArray(record.checks)) return { ok: false, reason: 'checks-array' }
  return { ok: true }
}

export function isSafeRecipientEmail(email) {
  if (!email?.trim()) return false
  return SAFE_RECIPIENT_PATTERNS.some((pattern) => pattern.test(email.trim()))
}

export function buildLiveDryRunPlan(options = {}) {
  const args = options.args || parseLiveDryRunArgs([])
  const envPresence = getEnvPresenceReport([...REQUIRED_ENV_KEYS, ...OPTIONAL_ENV_KEYS])
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || ''
  const managerEmail = process.env.ORDER_MANAGER_EMAIL?.trim() || ''

  const steps = [
    {
      id: 'env-presence',
      status: envPresence.filter((item) => REQUIRED_ENV_KEYS.includes(item.name)).every((item) => item.present)
        ? 'ready'
        : 'missing-required-env',
      printsSecrets: false,
    },
    {
      id: 'health-shape-contract',
      status: 'ready',
      printsSecrets: false,
    },
    {
      id: 'supabase-url-shape',
      status: validateSupabaseUrlShape(supabaseUrl).ok ? 'ready' : 'invalid',
      printsSecrets: false,
    },
    {
      id: 'safe-recipient-constraints',
      status: managerEmail ? (isSafeRecipientEmail(managerEmail) ? 'ready' : 'unsafe-recipient') : 'not-configured',
      printsSecrets: false,
    },
    {
      id: 'no-pii-logging-contract',
      status: 'ready',
      printsSecrets: false,
    },
    ...MUTATION_STEPS.map((step) => {
      const enabled =
        (step.requiresFlag === '--allow-mutation' && args.allowMutation) ||
        (step.requiresFlag === '--allow-manual-pricing-live' && args.allowManualPricingLive) ||
        (step.requiresFlag === '--allow-live-rls-probe' && args.allowLiveRlsProbe)
      return {
        id: step.id,
        status: enabled ? 'would-run-with-explicit-flag' : 'blocked-requires-explicit-approval',
        requiresFlag: step.requiresFlag,
        description: step.description,
        printsSecrets: false,
      }
    }),
  ]

  const mutationAllowed =
    args.allowMutation || args.allowManualPricingLive || args.allowLiveRlsProbe

  return {
    generatedAt: new Date().toISOString(),
    mode: 'dry-run',
    mutationAllowed,
    closureClaimed: false,
    liveMutationPerformed: false,
    envPresence,
    steps,
    nonClosureReminder:
      'Dry-run verifies readiness only. Live mutation, RLS apply, email send and release closure require explicit approval and separate verification.',
  }
}

export function redactEnvReport(report) {
  return report.map((item) => ({ name: item.name, present: item.present }))
}

async function maybeFetchHealth(baseUrl) {
  if (!baseUrl) return { skipped: true, reason: 'SMOKE_BASE_URL missing' }
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/health`)
    const payload = await response.json()
    return { skipped: false, ok: response.ok && validateHealthPayload(payload).ok, status: response.status }
  } catch (error) {
    return {
      skipped: false,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function main() {
  loadProjectEnvFiles()
  const args = parseLiveDryRunArgs()
  const plan = buildLiveDryRunPlan({ args })
  const health = await maybeFetchHealth(args.baseUrl)

  const report = {
    ...plan,
    health,
    envPresence: redactEnvReport(plan.envPresence),
  }

  console.log(JSON.stringify(report, null, 2))

  const requiredMissing = plan.envPresence
    .filter((item) => REQUIRED_ENV_KEYS.includes(item.name))
    .some((item) => !item.present)

  if (requiredMissing && !args.allowMutation) {
    process.exit(1)
  }

  if (args.allowMutation || args.allowManualPricingLive || args.allowLiveRlsProbe) {
    console.error('Mutation flags detected, but this harness performs dry-run only. Use dedicated live verify scripts with explicit approval.')
    process.exit(1)
  }
}

if (process.argv[1]?.includes('verify-live-dry-run.mjs')) {
  void main()
}
