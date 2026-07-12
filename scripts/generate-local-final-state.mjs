#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  RECOMMENDED_LOCAL_NEXT_STEPS,
  runGit,
} from './generate-local-branch-summary.mjs'

export const FINAL_STATE_JSON = 'local-final-state.json'
export const FINAL_STATE_MD = 'local-final-state.md'

export const EVIDENCE_CATEGORIES = [
  'Live-verified',
  'Local-contract verified',
  'Local-RC verified',
  'Deferred by user',
  'Future explicit workflow',
]

export const EVIDENCE_TRACKS = [
  {
    track: 'order_status_events RLS',
    category: 'Live-verified',
    evidence: 'Manual SQL applied; verify:order-status-events-rls-live PASS; post-manual verification PASS',
    remainingCondition: 'Formal backlog closure still requires merge/main evidence',
  },
  {
    track: 'pricing parity / P0-03 / P0-13',
    category: 'Local-contract verified',
    evidence: 'test:pricing-final-branch-verification-contract; test:pricing-parity-contract; test:checkout-submit-hook',
    remainingCondition: 'Live pricing smoke not part of this consolidation',
  },
  {
    track: 'production snapshots / P1-11A/B',
    category: 'Local-contract verified',
    evidence: 'test:production-final-branch-verification-contract; test:production-export-contract',
    remainingCondition: 'Factory handoff / Basis closure not claimed',
  },
  {
    track: 'customer platform MVP boundary / P1-27',
    category: 'Local-contract verified',
    evidence: 'test:customer-platform-mvp-boundary-contract',
    remainingCondition: 'Live customer platform smoke optional',
  },
  {
    track: 'operations/admin MVP boundary / P1-28',
    category: 'Local-contract verified',
    evidence: 'test:operations-mvp-boundary-contract; test:operations-workflow-security-contract',
    remainingCondition: 'Live ops workspace smoke optional',
  },
  {
    track: 'email retry/failure semantics / M9-P1-03',
    category: 'Local-contract verified',
    evidence: 'test:email-retry-failure-contract',
    remainingCondition: 'Live email send intentionally excluded',
  },
  {
    track: 'live dry-run and RLS plan/runbook',
    category: 'Local-contract verified',
    evidence: 'verify:live:dry-run; plan:live:rls-apply; report:live-rls-runbook; URL normalization guard',
    remainingCondition: 'Dry-run does not execute live probes',
  },
  {
    track: 'release candidate gate',
    category: 'Local-RC verified',
    evidence: 'check:release-candidate-local --list-only; execute result recorded separately',
    remainingCondition: '15/15 in user env after playwright install; agent env may differ',
  },
  {
    track: 'visual QA / D-13',
    category: 'Deferred by user',
    evidence: 'D-13 capture tooling exists; visual review intentionally deferred',
    remainingCondition: 'Human visual approval pending',
  },
  {
    track: 'remote Vercel preview/deploy',
    category: 'Future explicit workflow',
    evidence: 'No remote preview URL verified in this package',
    remainingCondition: 'User must explicitly request deploy workflow',
  },
  {
    track: 'governance local vs formal closure / Package 13',
    category: 'Local-contract verified',
    evidence: 'check:governance-closure-wording; test:governance-closure-wording-contract; test:local-final-state-contract',
    remainingCondition: 'Closed — Local is not Closed — Formal; formal merge/main evidence still pending',
  },
  {
    track: 'customer supabase RLS static contracts',
    category: 'Local-contract verified',
    evidence: 'test:customer-supabase-rls-static-contract; test:order-status-events-rls-migration-prep',
    remainingCondition: 'Live RLS beyond order_status_events not probed in this package',
  },
  {
    track: 'deferred MVP false-exposure guards',
    category: 'Local-contract verified',
    evidence: 'test:customer-platform-mvp-boundary-contract; test:operations-mvp-boundary-contract; test:email-retry-failure-contract; test:production-json-v4-support-policy',
    remainingCondition: 'Deferred features remain explicitly not claimed as finished MVP',
  },
  {
    track: 'formal merge/main/GitHub QA workflow',
    category: 'Future explicit workflow',
    evidence: 'Branch-local evidence only on task/epic-b-projects-foundation',
    remainingCondition: 'Push/PR/merge only when user chooses',
  },
  {
    track: 'Package 15 local hardening batch',
    category: 'Local-contract verified',
    evidence: 'WebGL E2E; customer RLS static; golden+2; v3/v4 boundary; status matrix; payment lifecycle; CR lock; pricing isolation; governance sync; deferred guards',
    remainingCondition: 'Formal Pending unchanged; no duplicate re-implementation unless regression',
  },
  {
    track: 'Package 17 local hardening batch II',
    category: 'Local-contract verified',
    evidence: 'RC script sync; PII/observability; ops double-action; project resume; constructor ownership; idempotency; P1-23 HDF; notifications DTO; RLS runbook plan; public order number DTO',
    remainingCondition: 'Formal Pending unchanged; live probes beyond order_status_events not executed',
  },
  {
    track: 'P1-23 HDF 3 mm production policy',
    category: 'Local-contract verified',
    evidence: 'test:production-hdf-thickness-contract',
    remainingCondition: 'Factory handoff / Basis closure not claimed',
  },
  {
    track: 'public order number RZM_ DTO consistency',
    category: 'Local-contract verified',
    evidence: 'test:customer-workspace; test:customer-order-detail',
    remainingCondition: 'Formal merge/main evidence still pending',
  },
  {
    track: 'expanded RLS runbook planning',
    category: 'Local-contract verified',
    evidence: 'test:live-rls-runbook-contract; test:live-rls-apply-plan-contract; plan:rls-readonly-probes',
    remainingCondition: 'Per-table live probes remain planned-not-executed',
  },
]

export const REQUIRED_WORDING = [
  'This is local consolidation evidence, not backlog closure.',
  'No release readiness is claimed.',
  'Visual QA remains deferred by user.',
  'Push/merge/deploy were not performed.',
  'Closed — Local is not Closed — Formal.',
  'order_status_events RLS is Verified — Live; Formal Pending remains.',
]

export const RECOMMENDED_NEXT_LOCAL_ACTIONS = [
  'Continue with next non-visual backlog track if any remains locally eligible.',
  'Keep visual/UX corrections deferred until the user explicitly reopens that scope.',
  'Re-run npm run check:release-candidate-local -- --execute after significant tracked changes.',
  'Re-run npm run verify:order-status-events-rls-live after Supabase policy changes.',
  'Do not push, merge, or deploy unless the user explicitly chooses that workflow.',
]

export function parseLocalFinalStateArgs(argv = process.argv.slice(2)) {
  const rcPassedIndex = argv.indexOf('--rc-passed')
  const rcTotalIndex = argv.indexOf('--rc-total')
  return {
    outputDir: resolve('artifacts/branch'),
    rlsProbePath: resolve('artifacts/live/order-status-events-rls-live-probe.json'),
    postManualPath: resolve('artifacts/live/order-status-events-rls-post-manual-verification.json'),
    rcPassed: rcPassedIndex >= 0 ? Number(argv[rcPassedIndex + 1]) : null,
    rcTotal: rcTotalIndex >= 0 ? Number(argv[rcTotalIndex + 1]) : null,
  }
}

export function readJsonIfExists(path) {
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

export function buildLocalFinalState(options = {}) {
  const args = options.args || parseLocalFinalStateArgs([])
  const branch = runGit(['branch', '--show-current'])
  const head = runGit(['rev-parse', 'HEAD'])

  const rlsProbe = readJsonIfExists(args.rlsProbePath)
  const postManual = readJsonIfExists(args.postManualPath)

  const liveVerified = EVIDENCE_TRACKS.filter((item) => item.category === 'Live-verified').map((item) => item.track)
  const localContractVerified = EVIDENCE_TRACKS.filter(
    (item) => item.category === 'Local-contract verified',
  ).map((item) => item.track)

  return {
    generatedAt: new Date().toISOString(),
    branch,
    head,
    localConsolidationEvidence: true,
    closureClaimed: false,
    releaseReady: false,
    backlogChanged: false,
    requiredWording: REQUIRED_WORDING,
    evidenceCategories: EVIDENCE_CATEGORIES,
    evidenceTracks: EVIDENCE_TRACKS,
    liveVerified,
    localContractVerified,
    rlsLiveVerification: {
      script: 'verify:order-status-events-rls-live',
      artifactPresent: Boolean(rlsProbe),
      verificationStatus: rlsProbe?.verificationStatus || postManual?.verificationStatus || 'not-run-in-artifact',
      anonDeniedOrHidden: rlsProbe?.anon?.rlsPass ?? postManual?.anonDeniedOrHidden ?? null,
      serviceRoleReadable: rlsProbe?.serviceRole?.servicePass ?? postManual?.serviceRoleReadable ?? null,
      liveVerifiedNotFormalClosure: true,
    },
    rcGate: options.rcGate || (args.rcPassed != null && args.rcTotal != null
      ? {
          mode: 'execute',
          total: args.rcTotal,
          passed: args.rcPassed,
          failed: args.rcTotal - args.rcPassed,
          failedCommands: args.rcPassed === args.rcTotal ? [] : ['see execute log'],
          closureClaimed: false,
          releaseReady: false,
        }
      : {
          mode: 'not-run',
          closureClaimed: false,
          releaseReady: false,
        }),
    visualStatus: {
      visualQaDeferred: true,
      d13ClosureClaimed: false,
    },
    liveDeployStatus: {
      liveMutationPerformedInPackage: false,
      liveEmailSent: false,
      vercelDeployPerformed: false,
      pushPrMergePerformed: false,
    },
    backlogImpact: 'current-backlog.md not changed by this package',
    remainingOpenTracks: [
      'Visual QA intentionally deferred; D-13 not closed',
      'Human visual approval pending',
      'Remote preview URL missing or not verified',
      'order_status_events RLS live-verified on Supabase; formal backlog closure still requires merge/main evidence',
      'Closed — Local evidence strengthened; Closed — Formal remains Formal Pending',
      'Formal closure requires merge/main + GitHub QA/main verification',
    ],
    recommendedNextLocalActions: RECOMMENDED_NEXT_LOCAL_ACTIONS,
    recommendedLocalNextSteps: RECOMMENDED_LOCAL_NEXT_STEPS,
    nonClosureReminder: REQUIRED_WORDING.join(' '),
  }
}

export function renderLocalFinalStateMarkdown(state) {
  const lines = [
    '# Local Final State Consolidation',
    '',
    `Generated: ${state.generatedAt}`,
    '',
    `- Branch: \`${state.branch}\``,
    `- HEAD: \`${state.head}\``,
    `- closureClaimed: ${state.closureClaimed}`,
    `- releaseReady: ${state.releaseReady}`,
    '',
    '## Required wording',
    ...state.requiredWording.map((item) => `- ${item}`),
    '',
    '## Evidence classification',
    '| Track | Category | Evidence | Remaining condition |',
    '|-------|----------|----------|---------------------|',
    ...state.evidenceTracks.map(
      (item) => `| ${item.track} | ${item.category} | ${item.evidence} | ${item.remainingCondition} |`,
    ),
    '',
    '## RLS live verification (not formal closure)',
    `- verificationStatus: ${state.rlsLiveVerification.verificationStatus}`,
    `- anonDeniedOrHidden: ${state.rlsLiveVerification.anonDeniedOrHidden}`,
    `- serviceRoleReadable: ${state.rlsLiveVerification.serviceRoleReadable}`,
    '',
    '## RC gate',
    `- mode: ${state.rcGate.mode}`,
    `- closureClaimed: ${state.rcGate.closureClaimed}`,
    `- releaseReady: ${state.rcGate.releaseReady}`,
    ...(state.rcGate.total != null ? [`- passed: ${state.rcGate.passed}/${state.rcGate.total}`] : []),
    ...(state.rcGate.failedCommands?.length
      ? [`- failedCommands: ${state.rcGate.failedCommands.join(', ')}`]
      : []),
  ]

  lines.push('', '## Recommended next local actions')
  for (const step of state.recommendedNextLocalActions) lines.push(`1. ${step}`)
  lines.push('', state.nonClosureReminder)
  return `${lines.join('\n')}\n`
}

export function writeLocalFinalStateArtifacts(state, outputDir = resolve('artifacts/branch')) {
  mkdirSync(outputDir, { recursive: true })
  const jsonPath = resolve(outputDir, FINAL_STATE_JSON)
  const mdPath = resolve(outputDir, FINAL_STATE_MD)
  writeFileSync(jsonPath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
  writeFileSync(mdPath, `${renderLocalFinalStateMarkdown(state)}\n`, 'utf8')
  return { jsonPath, mdPath }
}

function main() {
  const args = parseLocalFinalStateArgs()
  const state = buildLocalFinalState({ args })
  const paths = writeLocalFinalStateArtifacts(state, args.outputDir)
  console.log(JSON.stringify({ event: 'local_final_state', paths, ...state }, null, 2))
}

if (process.argv[1]?.includes('generate-local-final-state.mjs')) {
  main()
}
