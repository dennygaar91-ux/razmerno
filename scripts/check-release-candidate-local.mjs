#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

export const RELEASE_CANDIDATE_COMMANDS = [
  'npm test',
  'npm run typecheck',
  'npm run typecheck:api',
  'npm run build',
  'npm run test:release-e2e',
  'npm run check:release-security',
  'npm run check:bundle-baseline',
  'npm run test:production-export-contract',
  'npm run test:pricing-parity-contract',
  'npm run test:customer-platform-mvp-boundary-contract',
  'npm run test:operations-mvp-boundary-contract',
  'npm run verify:live:dry-run',
]

export const NON_CLOSURE_BLOCKERS = [
  'Visual QA intentionally deferred; D-13 not closed',
  'Human visual approval pending',
  'Remote preview URL missing or not verified',
  'Live Supabase mutation / RLS apply not performed without explicit approval',
  'Formal closure requires merge/main + GitHub QA/main verification',
]

export function parseReleaseCandidateArgs(argv = process.argv.slice(2)) {
  return {
    listOnly: argv.includes('--list-only'),
    skipExecution: argv.includes('--skip-execution'),
  }
}

export function buildReleaseCandidatePlan() {
  return {
    generatedAt: new Date().toISOString(),
    commands: RELEASE_CANDIDATE_COMMANDS,
    blockers: NON_CLOSURE_BLOCKERS,
    closureClaimed: false,
    releaseReady: false,
  }
}

export function runReleaseCandidateCommand(command, options = {}) {
  const shell = options.shell ?? true
  const result = spawnSync(command, {
    shell,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return {
    command,
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout || '').slice(-4000),
    stderr: (result.stderr || '').slice(-4000),
  }
}

export function summarizeReleaseCandidateResults(results) {
  const failed = results.filter((item) => !item.ok)
  return {
    total: results.length,
    passed: results.filter((item) => item.ok).length,
    failed: failed.length,
    failedCommands: failed.map((item) => item.command),
    closureClaimed: false,
    releaseReady: false,
    blockers: NON_CLOSURE_BLOCKERS,
  }
}

function main() {
  const args = parseReleaseCandidateArgs()
  const plan = buildReleaseCandidatePlan()

  console.log(JSON.stringify({ event: 'release_candidate_local_plan', ...plan }, null, 2))
  console.error('Non-closure blockers:')
  for (const blocker of NON_CLOSURE_BLOCKERS) {
    console.error(`- ${blocker}`)
  }

  if (args.listOnly || args.skipExecution) {
    return
  }

  const results = []
  for (const command of RELEASE_CANDIDATE_COMMANDS) {
    console.error(`\n> ${command}`)
    const result = runReleaseCandidateCommand(command)
    results.push(result)
    if (!result.ok) {
      console.error(result.stderr || result.stdout)
      break
    }
  }

  const summary = summarizeReleaseCandidateResults(results)
  console.log(JSON.stringify({ event: 'release_candidate_local_summary', ...summary }, null, 2))
  if (summary.failed > 0) process.exit(1)
}

if (process.argv[1]?.includes('check-release-candidate-local.mjs')) {
  main()
}
