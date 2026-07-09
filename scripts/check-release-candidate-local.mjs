#!/usr/bin/env node

import { spawnSync } from 'node:child_process'

export const RELEASE_CANDIDATE_COMMANDS = [
  'npm test',
  'npm run typecheck',
  'npm run typecheck:api',
  'npm run build',
  'npm run test:release-e2e',
  'npm run check:release-security',
  'npm run check:bundle-baseline',
  'npm run test:pricing-final-branch-verification',
  'npm run test:production-final-branch-verification',
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

export const EXCLUDED_FROM_GATE = [
  'D-13 visual capture/review scripts',
  'Live mutation scripts (--allow-mutation, live apply, live email send)',
]

export function parseReleaseCandidateArgs(argv = process.argv.slice(2)) {
  return {
    listOnly: argv.includes('--list-only') || (!argv.includes('--execute') && !argv.includes('--skip-execution')),
    execute: argv.includes('--execute'),
    continueOnError: argv.includes('--continue-on-error'),
    skipExecution: argv.includes('--skip-execution'),
  }
}

export function buildReleaseCandidatePlan() {
  return {
    generatedAt: new Date().toISOString(),
    mode: 'list-only',
    commands: RELEASE_CANDIDATE_COMMANDS,
    excluded: EXCLUDED_FROM_GATE,
    blockers: NON_CLOSURE_BLOCKERS,
    closureClaimed: false,
    releaseReady: false,
  }
}

export function summarizeCommandOutput(stdout = '', stderr = '') {
  const combined = `${stdout}\n${stderr}`.trim()
  const lines = combined.split(/\r?\n/).filter(Boolean)
  const tail = lines.slice(-8)
  return {
    lineCount: lines.length,
    tail,
  }
}

export function runReleaseCandidateCommand(command, options = {}) {
  const shell = options.shell ?? true
  const result = spawnSync(command, {
    shell,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const stdout = result.stdout || ''
  const stderr = result.stderr || ''
  return {
    command,
    ok: result.status === 0,
    status: result.status,
    stdout,
    stderr,
    summary: summarizeCommandOutput(stdout, stderr),
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
    excluded: EXCLUDED_FROM_GATE,
  }
}

function printBlockers() {
  console.error('Non-closure blockers:')
  for (const blocker of NON_CLOSURE_BLOCKERS) {
    console.error(`- ${blocker}`)
  }
  console.error('Excluded from gate:')
  for (const item of EXCLUDED_FROM_GATE) {
    console.error(`- ${item}`)
  }
}

function main() {
  const args = parseReleaseCandidateArgs()
  const plan = {
    ...buildReleaseCandidatePlan(),
    mode: args.execute ? 'execute' : 'list-only',
    continueOnError: args.continueOnError,
  }

  console.log(JSON.stringify({ event: 'release_candidate_local_plan', ...plan }, null, 2))
  printBlockers()

  if (args.listOnly || args.skipExecution || !args.execute) {
    return
  }

  const results = []
  for (const command of RELEASE_CANDIDATE_COMMANDS) {
    console.error(`\n> ${command}`)
    const result = runReleaseCandidateCommand(command)
    results.push({
      command: result.command,
      ok: result.ok,
      status: result.status,
      summary: result.summary,
    })
    if (!result.ok) {
      console.error(JSON.stringify({ event: 'release_candidate_command_failed', ...result.summary }, null, 2))
      if (!args.continueOnError) break
    }
  }

  const summary = summarizeReleaseCandidateResults(results)
  console.log(JSON.stringify({ event: 'release_candidate_local_summary', ...summary }, null, 2))
  printBlockers()
  if (summary.failed > 0) process.exit(1)
}

if (process.argv[1]?.includes('check-release-candidate-local.mjs')) {
  main()
}
