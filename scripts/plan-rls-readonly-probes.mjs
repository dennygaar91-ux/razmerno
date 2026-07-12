#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { normalizeSupabaseProjectUrl } from './load-project-env.mjs'
import { ADDITIONAL_PLANNED_PROBE_TABLES } from './generate-live-rls-runbook.mjs'

export const PROBE_PLAN_JSON = 'rls-readonly-probe-plan.json'
export const PROBE_PLAN_MD = 'rls-readonly-probe-plan.md'

export const SAFETY_CONSTRAINTS = [
  'No network calls by default',
  'No ALTER/CREATE/DROP/INSERT/UPDATE/DELETE in generated plans',
  'No secrets or service role keys in generated artifacts',
  'planned-not-executed probes must not be reported as live-verified',
  'Generated artifact is not closure evidence',
]

export function parseRlsReadonlyProbePlanArgs(argv = process.argv.slice(2)) {
  return {
    outputDir: resolve('artifacts/live'),
    execute: argv.includes('--execute'),
    writeArtifacts: !argv.includes('--no-artifacts'),
    supabaseUrl: process.env.SUPABASE_URL?.trim() || null,
  }
}

export function buildRlsReadonlyProbePlan(options = {}) {
  const args = options.args || parseRlsReadonlyProbePlanArgs([])
  const normalizedUrl = args.supabaseUrl ? normalizeSupabaseProjectUrl(args.supabaseUrl) : null

  return {
    generatedAt: new Date().toISOString(),
    purpose: 'Per-table read-only RLS probe planning framework (plan only)',
    liveMutationPerformed: false,
    closureClaimed: false,
    plannedProbesExecuted: false,
    networkCallsPerformed: false,
    executeRequested: args.execute,
    executeAllowed: false,
    supabaseUrlNormalized: normalizedUrl,
    tables: ADDITIONAL_PLANNED_PROBE_TABLES.map((item) => ({
      table: item.table,
      migrationFile: item.migrationFile,
      probeStatus: 'planned-not-executed',
      readOnlyProbeSafe: item.readOnlyProbeSafe,
      expectedAnonBehavior: item.expectedAnonBehavior,
      expectedAuthenticatedBehavior: item.expectedAuthenticatedBehavior,
      expectedServiceRoleBehavior: item.expectedServiceRoleBehavior,
      recommendedRestPath: `/rest/v1/${item.table.split('.').pop()}?select=id&limit=1`,
      mutationMethodsForbidden: ['POST', 'PATCH', 'PUT', 'DELETE'],
    })),
    safetyConstraints: SAFETY_CONSTRAINTS,
    nonClosureReminder:
      'This plan documents per-table read-only probes only. It does not execute live probes and is not closure evidence.',
  }
}

export function renderRlsReadonlyProbePlanMarkdown(plan) {
  const lines = [
    '# RLS Read-Only Probe Plan',
    '',
    `Generated: ${plan.generatedAt}`,
    '',
    `- liveMutationPerformed: ${plan.liveMutationPerformed}`,
    `- closureClaimed: ${plan.closureClaimed}`,
    `- plannedProbesExecuted: ${plan.plannedProbesExecuted}`,
    `- networkCallsPerformed: ${plan.networkCallsPerformed}`,
    '',
    '## Planned tables',
    '',
  ]

  for (const table of plan.tables) {
    lines.push(`### ${table.table}`)
    lines.push(`- migration: ${table.migrationFile}`)
    lines.push(`- probeStatus: ${table.probeStatus}`)
    lines.push(`- anon: ${table.expectedAnonBehavior}`)
    lines.push(`- authenticated: ${table.expectedAuthenticatedBehavior}`)
    lines.push(`- service_role: ${table.expectedServiceRoleBehavior}`)
    lines.push(`- restPath: ${table.recommendedRestPath}`)
    lines.push('')
  }

  lines.push('## Safety constraints')
  for (const item of plan.safetyConstraints) {
    lines.push(`- ${item}`)
  }
  lines.push('')
  lines.push(plan.nonClosureReminder)
  return lines.join('\n')
}

export function writeRlsReadonlyProbePlanArtifacts(plan, args = parseRlsReadonlyProbePlanArgs([])) {
  if (!args.writeArtifacts) {
    return { jsonPath: null, mdPath: null }
  }
  mkdirSync(args.outputDir, { recursive: true })
  const jsonPath = resolve(args.outputDir, PROBE_PLAN_JSON)
  const mdPath = resolve(args.outputDir, PROBE_PLAN_MD)
  writeFileSync(jsonPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8')
  writeFileSync(mdPath, `${renderRlsReadonlyProbePlanMarkdown(plan)}\n`, 'utf8')
  return { jsonPath, mdPath }
}

function main() {
  const args = parseRlsReadonlyProbePlanArgs()
  if (args.execute) {
    console.error('RLS readonly probe plan does not support --execute. Use verify:order-status-events-rls-live for the approved live probe.')
    process.exit(1)
  }
  const plan = buildRlsReadonlyProbePlan({ args })
  const paths = writeRlsReadonlyProbePlanArtifacts(plan, args)
  console.log(JSON.stringify({ event: 'rls_readonly_probe_plan', ...plan, artifacts: paths }, null, 2))
}

if (process.argv[1]?.includes('plan-rls-readonly-probes.mjs')) {
  main()
}
