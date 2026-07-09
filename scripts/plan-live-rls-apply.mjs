#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { getEnvPresenceReport, loadProjectEnvFiles } from './load-project-env.mjs'

export const RLS_MIGRATION_FILE = 'supabase/migrations/20260708_enable_order_status_events_rls.sql'
export const RLS_REFERENCE_FILE = 'db/order-status-events.sql'

export const PREFLIGHT_CHECKS = [
  'Confirm branch contains reviewed migration SQL locally',
  'Confirm no frontend direct access to order_status_events',
  'Confirm API writers use SUPABASE_SERVICE_ROLE_KEY only',
  'Confirm staging/local contract tests pass: test:order-status-events-rls-migration-prep',
  'Confirm explicit user approval for live apply is recorded',
]

export const MANUAL_APPLY_STEPS = [
  'Open Supabase SQL editor or approved migration pipeline',
  'Run migration SQL from 20260708_enable_order_status_events_rls.sql',
  'Verify RLS is enabled on public.order_status_events',
  'Verify policy order_status_events_deny_all exists',
  'Re-run service-role API smoke for status event writes',
]

export const ROLLBACK_STEPS = [
  'drop policy if exists order_status_events_deny_all on public.order_status_events;',
  'alter table public.order_status_events disable row level security;',
  'Document rollback reason and re-open security follow-up',
]

export const VERIFICATION_QUERIES = [
  "select relrowsecurity from pg_class where relname = 'order_status_events';",
  "select polname, polcmd from pg_policy where polrelid = 'public.order_status_events'::regclass;",
  'select count(*) from public.order_status_events; -- service role only',
]

export function parseRlsApplyPlanArgs(argv = process.argv.slice(2)) {
  return {
    apply: argv.includes('--apply'),
    outputDir: resolve('artifacts/live'),
  }
}

export function extractOrderStatusEventsRlsSql(migrationSource) {
  const statements = []
  const lines = migrationSource.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('--')) continue
    statements.push(trimmed)
  }
  return statements.join('\n')
}

export function buildLiveRlsApplyPlan(options = {}) {
  const args = options.args || parseRlsApplyPlanArgs([])
  const migrationPath = resolve(RLS_MIGRATION_FILE)
  const migrationSource = readFileSync(migrationPath, 'utf8')
  const referenceSource = readFileSync(resolve(RLS_REFERENCE_FILE), 'utf8')

  return {
    generatedAt: new Date().toISOString(),
    mode: 'plan-only',
    liveMutationPerformed: false,
    closureClaimed: false,
    requiresExplicitApproval: true,
    migrationFiles: [RLS_MIGRATION_FILE, RLS_REFERENCE_FILE],
    extractedSql: extractOrderStatusEventsRlsSql(migrationSource),
    preflightChecks: PREFLIGHT_CHECKS,
    manualApplySteps: MANUAL_APPLY_STEPS,
    rollbackSteps: ROLLBACK_STEPS,
    verificationQueries: VERIFICATION_QUERIES,
    applyFlagPassed: args.apply,
    applyBlockedReason: args.apply
      ? 'Live apply is intentionally refused by this generator. Use explicit approved migration pipeline.'
      : null,
    referenceMirrorsMigration: referenceSource.includes('order_status_events_deny_all'),
    envPresence: getEnvPresenceReport(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']).map((item) => ({
      name: item.name,
      present: item.present,
    })),
    nonClosureReminder:
      'This plan does not apply migrations. Live RLS apply requires explicit user approval and separate verification.',
  }
}

export function renderLiveRlsApplyPlanMarkdown(plan) {
  return [
    '# order_status_events RLS Live Apply Plan',
    '',
    `Generated: ${plan.generatedAt}`,
    '',
    '## Status',
    `- mode: ${plan.mode}`,
    `- liveMutationPerformed: ${plan.liveMutationPerformed}`,
    `- requiresExplicitApproval: ${plan.requiresExplicitApproval}`,
    '',
    '## Migration files',
    ...plan.migrationFiles.map((file) => `- ${file}`),
    '',
    '## Extracted SQL',
    '```sql',
    plan.extractedSql,
    '```',
    '',
    '## Preflight checks',
    ...plan.preflightChecks.map((item) => `- ${item}`),
    '',
    '## Manual apply steps',
    ...plan.manualApplySteps.map((item) => `- ${item}`),
    '',
    '## Rollback / disable steps',
    ...plan.rollbackSteps.map((item) => `- ${item}`),
    '',
    '## Verification queries',
    ...plan.verificationQueries.map((item) => `- \`${item}\``),
    '',
    plan.nonClosureReminder,
  ].join('\n')
}

export function writeLiveRlsApplyPlanArtifacts(plan, outputDir = resolve('artifacts/live')) {
  mkdirSync(outputDir, { recursive: true })
  const jsonPath = resolve(outputDir, 'rls-apply-plan.json')
  const mdPath = resolve(outputDir, 'rls-apply-plan.md')
  writeFileSync(jsonPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8')
  writeFileSync(mdPath, `${renderLiveRlsApplyPlanMarkdown(plan)}\n`, 'utf8')
  return { jsonPath, mdPath }
}

function main() {
  loadProjectEnvFiles()
  const args = parseRlsApplyPlanArgs()
  const plan = buildLiveRlsApplyPlan({ args })
  const paths = writeLiveRlsApplyPlanArtifacts(plan, args.outputDir)

  console.log(JSON.stringify({ event: 'live_rls_apply_plan', paths, ...plan }, null, 2))

  if (args.apply) {
    console.error(plan.applyBlockedReason)
    process.exit(1)
  }
}

if (process.argv[1]?.includes('plan-live-rls-apply.mjs')) {
  main()
}
