#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const DEFAULT_BASE_REF = 'main'
export const PACKAGE_COMMIT_MARKERS = [
  { package: 'Package 01', pattern: /production|pricing|observability|release-security|bundle-baseline/i },
  { package: 'Package 02', pattern: /customer platform|operations workspace|payment|completion/i },
  { package: 'Package 03', pattern: /d13|visual|port hygiene|human review/i },
  { package: 'Package 04', pattern: /mvp boundary|live verification dry|release candidate gate|order status events rls/i },
  { package: 'Package 05', pattern: /email retry|pricing final branch|production final branch|live rls apply plan/i },
  { package: 'Package 06', pattern: /package script integration|generated local artifacts|local branch summary/i },
  { package: 'Package 07', pattern: /local branch terminology|local branch summary/i },
]

export const NON_CLOSURE_BLOCKERS = [
  'Visual QA intentionally deferred; D-13 not closed',
  'Human visual approval pending',
  'Remote preview URL missing or not verified',
  'Live Supabase mutation / RLS apply not performed without explicit approval',
  'Formal closure requires merge/main + GitHub QA/main verification',
]

export const RECOMMENDED_LOCAL_NEXT_STEPS = [
  'Keep visual/UX work deferred unless the user explicitly reopens it',
  'Optionally run npm run check:release-candidate-local -- --execute after major local changes',
  'Apply live Supabase RLS only after explicit user approval',
  'Do not push, merge, or deploy unless the user explicitly requests that workflow',
  'Formal closure still requires main/GitHub QA only when the user chooses that workflow',
]

export function parseLocalBranchSummaryArgs(argv = process.argv.slice(2)) {
  const baseIndex = argv.indexOf('--base')
  return {
    baseRef: baseIndex >= 0 ? argv[baseIndex + 1] : DEFAULT_BASE_REF,
    outputDir: resolve('artifacts/branch'),
  }
}

export function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

export function readGitLog(range) {
  const output = runGit(['log', range, '--format=%H%x09%s'])
  if (!output) return []
  return output.split('\n').filter(Boolean).map((line) => {
    const tabIndex = line.indexOf('\t')
    if (tabIndex < 0) return { hash: line.slice(0, 8), subject: line }
    return {
      hash: line.slice(0, tabIndex).slice(0, 8),
      subject: line.slice(tabIndex + 1),
    }
  })
}

export function listBranchScripts() {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
  const prefixes = [
    'test:pricing-final',
    'test:production-final',
    'test:customer-platform-mvp',
    'test:operations-mvp',
    'test:email-retry',
    'test:live-',
    'test:release-candidate',
    'test:package-script',
    'test:local-branch-summary',
    'verify:live',
    'plan:live',
    'check:release-candidate',
    'report:local-branch',
    'report:d13',
    'dev:ports',
  ]
  return Object.keys(packageJson.scripts)
    .filter((name) => prefixes.some((prefix) => name.startsWith(prefix)))
    .sort()
}

export function groupCommitsByPackage(commits) {
  const groups = new Map(PACKAGE_COMMIT_MARKERS.map((item) => [item.package, []]))
  const other = []
  for (const commit of commits) {
    const marker = PACKAGE_COMMIT_MARKERS.find((item) => item.pattern.test(commit.subject))
    if (marker) {
      groups.get(marker.package)?.push(commit)
    } else {
      other.push(commit)
    }
  }
  return { groups, other }
}

export function buildLocalBranchSummary(options = {}) {
  const args = options.args || parseLocalBranchSummaryArgs([])
  const branch = runGit(['branch', '--show-current'])
  const head = runGit(['rev-parse', 'HEAD'])
  let baseRef = args.baseRef
  let range = `${baseRef}..HEAD`
  try {
    runGit(['merge-base', baseRef, 'HEAD'])
  } catch {
    baseRef = `${head}^`
    range = `${head}^..HEAD`
  }

  const commits = readGitLog(range)
  const { groups, other } = groupCommitsByPackage(commits)
  const scriptsAdded = listBranchScripts()

  return {
    generatedAt: new Date().toISOString(),
    localBranchSummary: true,
    branch,
    head,
    baseRef,
    commitRange: range,
    commitCount: commits.length,
    commits,
    packageGroups: Object.fromEntries(
      [...groups.entries()].map(([name, items]) => [name, items]),
    ),
    ungroupedCommits: other,
    scriptsAdded,
    aggregateVerification: options.aggregateVerification || null,
    releaseCandidate: options.releaseCandidate || null,
    localIntegrationStatus: 'local branch integration evidence only',
    localIntegrationReady: false,
    liveStatus: {
      liveMutationPerformed: false,
      liveMigrationApplyPerformed: false,
      liveEmailSent: false,
      vercelDeployPerformed: false,
    },
    visualStatus: {
      visualQaDeferred: true,
      d13ClosureClaimed: false,
    },
    closureClaimed: false,
    releaseReady: false,
    blockers: NON_CLOSURE_BLOCKERS,
    localSummaryTitle: 'Local branch integration — non-visual MVP contracts and release gates',
    recommendedLocalNextSteps: RECOMMENDED_LOCAL_NEXT_STEPS,
    localHandoffSummary: [
      'Local-only branch integration summary for ongoing development.',
      'Visual QA / D-13 remain deferred; no live Supabase apply, email send, or deploy in this evidence.',
    ].join(' '),
  }
}

export function renderLocalBranchSummaryMarkdown(summary) {
  const lines = [
    '# Local Branch Integration Summary',
    '',
    `- Branch: \`${summary.branch}\``,
    `- HEAD: \`${summary.head}\``,
    `- Range: \`${summary.commitRange}\` (${summary.commitCount} commits)`,
    `- Generated: ${summary.generatedAt}`,
    '',
    '## Local integration status',
    `- localIntegrationStatus: ${summary.localIntegrationStatus}`,
    `- localIntegrationReady: ${summary.localIntegrationReady}`,
    `- closureClaimed: ${summary.closureClaimed}`,
    `- releaseReady: ${summary.releaseReady}`,
    `- visual QA: deferred`,
    `- live mutation: no`,
    `- deploy: no`,
    '',
    '## Package commit groups (heuristic)',
  ]

  for (const [name, items] of Object.entries(summary.packageGroups)) {
    lines.push(`### ${name}`)
    if (!items.length) {
      lines.push('- (none in range)')
    } else {
      for (const item of items) {
        lines.push(`- \`${item.hash}\` ${item.subject}`)
      }
    }
    lines.push('')
  }

  if (summary.ungroupedCommits.length) {
    lines.push('## Other commits in range')
    for (const item of summary.ungroupedCommits) {
      lines.push(`- \`${item.hash}\` ${item.subject}`)
    }
    lines.push('')
  }

  lines.push('## Scripts added (filtered)')
  for (const script of summary.scriptsAdded) lines.push(`- \`${script}\``)
  lines.push('', '## Non-closure blockers')
  for (const blocker of summary.blockers) lines.push(`- ${blocker}`)
  lines.push('', '## Recommended Next Local Steps')
  for (const step of summary.recommendedLocalNextSteps) lines.push(`1. ${step}`)
  lines.push('', '## Local handoff summary', summary.localHandoffSummary)
  return `${lines.join('\n')}\n`
}

export function writeLocalBranchSummaryArtifacts(summary, outputDir = resolve('artifacts/branch')) {
  mkdirSync(outputDir, { recursive: true })
  const jsonPath = resolve(outputDir, 'local-branch-summary.json')
  const mdPath = resolve(outputDir, 'local-branch-summary.md')
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  writeFileSync(mdPath, renderLocalBranchSummaryMarkdown(summary), 'utf8')
  return { jsonPath, mdPath }
}

function main() {
  const args = parseLocalBranchSummaryArgs()
  const summary = buildLocalBranchSummary({ args })
  const paths = writeLocalBranchSummaryArtifacts(summary, args.outputDir)
  console.log(JSON.stringify({ event: 'local_branch_summary', paths, ...summary }, null, 2))
}

if (process.argv[1]?.includes('generate-local-branch-summary.mjs')) {
  main()
}
