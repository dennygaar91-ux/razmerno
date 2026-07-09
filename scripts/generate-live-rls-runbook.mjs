#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadProjectEnvFiles } from './load-project-env.mjs'
import {
  LIVE_RLS_APPROVAL_ENV_KEY,
  LIVE_RLS_APPROVAL_PHRASE,
  MANUAL_APPLY_STEPS,
  PREFLIGHT_CHECKS,
  RLS_MIGRATION_FILE,
  RLS_REFERENCE_FILE,
  ROLLBACK_STEPS,
  VERIFICATION_QUERIES,
  buildLiveRlsApplyPlan,
  parseRlsApplyPlanArgs,
} from './plan-live-rls-apply.mjs'

export const RUNBOOK_TARGET_TABLE = 'public.order_status_events'
export const RUNBOOK_JSON_NAME = 'order-status-events-rls-runbook.json'
export const RUNBOOK_MD_NAME = 'order-status-events-rls-runbook.md'

export const BACKUP_RECOMMENDATIONS = [
  'Capture current pg_policy rows for public.order_status_events before apply',
  'Record current relrowsecurity state from pg_class',
  'Keep a copy of the reviewed migration SQL in version control',
  'Confirm rollback SQL is available before live apply',
]

export const SAFETY_CONSTRAINTS = [
  'No automatic live apply from this repository tooling',
  'No secrets or service role keys in generated artifacts',
  'Service-role API paths remain the only approved write path',
  'Anon/authenticated direct table access must remain denied after apply',
  'Generated artifact is not closure evidence',
]

export function parseLiveRlsRunbookArgs(argv = process.argv.slice(2)) {
  return {
    outputDir: resolve('artifacts/live'),
    apply: argv.includes('--apply'),
  }
}

export function buildLiveRlsRunbook(options = {}) {
  const args = options.args || parseLiveRlsRunbookArgs([])
  const plan = buildLiveRlsApplyPlan({ args: parseRlsApplyPlanArgs(args.apply ? ['--apply'] : []) })

  return {
    generatedAt: new Date().toISOString(),
    purpose:
      'Manual operator runbook for live Supabase RLS apply on order_status_events. Planning and verification only.',
    targetTable: RUNBOOK_TARGET_TABLE,
    liveMutationPerformed: false,
    closureClaimed: false,
    requiresExplicitApproval: true,
    approvalEnvKey: LIVE_RLS_APPROVAL_ENV_KEY,
    approvalPhraseRequired: LIVE_RLS_APPROVAL_PHRASE,
    migrationFiles: [RLS_MIGRATION_FILE, RLS_REFERENCE_FILE],
    sqlPreview: plan.extractedSql,
    preflightChecklist: PREFLIGHT_CHECKS,
    backupRecommendations: BACKUP_RECOMMENDATIONS,
    manualApplyOptions: [
      'Supabase SQL editor with reviewed migration SQL',
      'Approved migration pipeline using supabase/migrations/20260708_enable_order_status_events_rls.sql',
      'Manual step-by-step apply from extracted SQL preview in artifacts/live/rls-apply-plan.json',
    ],
    manualApplySteps: MANUAL_APPLY_STEPS,
    verificationQueries: VERIFICATION_QUERIES,
    rollbackSteps: ROLLBACK_STEPS,
    safetyConstraints: SAFETY_CONSTRAINTS,
    nonClosureReminder:
      'This runbook does not apply migrations, deploy, merge, or claim release closure.',
    relatedArtifacts: [
      'artifacts/live/rls-apply-plan.json',
      'artifacts/live/rls-apply-plan.md',
      'artifacts/live/order-status-events-rls-runbook.json',
      'artifacts/live/order-status-events-rls-runbook.md',
    ],
  }
}

export function renderLiveRlsRunbookMarkdown(runbook) {
  return [
    '# order_status_events Live RLS Apply Runbook',
    '',
    `Generated: ${runbook.generatedAt}`,
    '',
    '## Purpose',
    runbook.purpose,
    '',
    '## Status',
    `- targetTable: ${runbook.targetTable}`,
    `- liveMutationPerformed: ${runbook.liveMutationPerformed}`,
    `- closureClaimed: ${runbook.closureClaimed}`,
    `- requiresExplicitApproval: ${runbook.requiresExplicitApproval}`,
    '',
    '## Approval requirement',
    `Set ${runbook.approvalEnvKey}=${runbook.approvalPhraseRequired} before any future live apply tooling.`,
    '',
    '## Migration files',
    ...runbook.migrationFiles.map((file) => `- ${file}`),
    '',
    '## SQL preview',
    '```sql',
    runbook.sqlPreview,
    '```',
    '',
    '## Preflight checklist',
    ...runbook.preflightChecklist.map((item) => `- ${item}`),
    '',
    '## Backup / checkpoint recommendations',
    ...runbook.backupRecommendations.map((item) => `- ${item}`),
    '',
    '## Manual apply options',
    ...runbook.manualApplyOptions.map((item) => `- ${item}`),
    '',
    '## Manual apply steps',
    ...runbook.manualApplySteps.map((item) => `- ${item}`),
    '',
    '## Verification queries',
    ...runbook.verificationQueries.map((item) => `- \`${item}\``),
    '',
    '## Rollback / disable steps',
    ...runbook.rollbackSteps.map((item) => `- ${item}`),
    '',
    '## Safety constraints',
    ...runbook.safetyConstraints.map((item) => `- ${item}`),
    '',
    runbook.nonClosureReminder,
  ].join('\n')
}

export function writeLiveRlsRunbookArtifacts(runbook, outputDir = resolve('artifacts/live')) {
  mkdirSync(outputDir, { recursive: true })
  const jsonPath = resolve(outputDir, RUNBOOK_JSON_NAME)
  const mdPath = resolve(outputDir, RUNBOOK_MD_NAME)
  writeFileSync(jsonPath, `${JSON.stringify(runbook, null, 2)}\n`, 'utf8')
  writeFileSync(mdPath, `${renderLiveRlsRunbookMarkdown(runbook)}\n`, 'utf8')
  return { jsonPath, mdPath }
}

function main() {
  loadProjectEnvFiles()
  const args = parseLiveRlsRunbookArgs()
  const runbook = buildLiveRlsRunbook({ args })
  const paths = writeLiveRlsRunbookArtifacts(runbook, args.outputDir)

  console.log(JSON.stringify({ event: 'live_rls_runbook', paths, ...runbook }, null, 2))
}

if (process.argv[1]?.includes('generate-live-rls-runbook.mjs')) {
  main()
}
