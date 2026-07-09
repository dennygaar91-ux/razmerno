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
  { package: 'Package 06', pattern: /pre pr branch summary|package script integration|generated local artifacts/i },
]

export const NON_CLOSURE_BLOCKERS = [
  'Visual QA intentionally deferred; D-13 not closed',
  'Human visual approval pending',
  'Remote preview URL missing or not verified',
  'Live Supabase mutation / RLS apply not performed without explicit approval',
  'Formal closure requires merge/main + GitHub QA/main verification',
]

export function parsePrePrSummaryArgs(argv = process.argv.slice(2)) {
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
    'test:branch-pre-pr',
    'verify:live',
    'plan:live',
    'check:release-candidate',
    'report:branch',
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

export function buildPrePrSummary(options = {}) {
  const args = options.args || parsePrePrSummaryArgs([])
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
    prDraft: {
      title: 'feat: epic B projects foundation — non-visual MVP contracts and release gates',
      body: [
        '## Summary',
        '- Adds non-visual contract tests, verification packs, and local release gates from Packages 01–06.',
        '- Defers visual QA / D-13 closure; no live Supabase apply, email send, or deploy in this branch evidence.',
        '',
        '## Test plan',
        '- [ ] npm test',
        '- [ ] npm run typecheck && npm run typecheck:api',
        '- [ ] npm run build',
        '- [ ] npm run check:release-candidate-local -- --execute',
        '- [ ] GitHub QA on main after merge',
      ].join('\n'),
    },
  }
}

export function renderPrePrSummaryMarkdown(summary) {
  const lines = [
    '# Branch Pre-PR Summary',
    '',
    `- Branch: \`${summary.branch}\``,
    `- HEAD: \`${summary.head}\``,
    `- Range: \`${summary.commitRange}\` (${summary.commitCount} commits)`,
    `- Generated: ${summary.generatedAt}`,
    '',
    '## Status',
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
  lines.push('', '## PR draft', `**Title:** ${summary.prDraft.title}`, '', summary.prDraft.body)
  return `${lines.join('\n')}\n`
}

export function writePrePrSummaryArtifacts(summary, outputDir = resolve('artifacts/branch')) {
  mkdirSync(outputDir, { recursive: true })
  const jsonPath = resolve(outputDir, 'pre-pr-summary.json')
  const mdPath = resolve(outputDir, 'pre-pr-summary.md')
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  writeFileSync(mdPath, renderPrePrSummaryMarkdown(summary), 'utf8')
  return { jsonPath, mdPath }
}

function main() {
  const args = parsePrePrSummaryArgs()
  const summary = buildPrePrSummary({ args })
  const paths = writePrePrSummaryArtifacts(summary, args.outputDir)
  console.log(JSON.stringify({ event: 'branch_pre_pr_summary', paths, ...summary }, null, 2))
}

if (process.argv[1]?.includes('generate-branch-pre-pr-summary.mjs')) {
  main()
}
