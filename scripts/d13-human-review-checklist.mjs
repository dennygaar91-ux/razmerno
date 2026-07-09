#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { buildD13LocalVisualIndex } from './d13-local-visual-qa-report.mjs'

const ROOT = process.cwd()
const D13_ROOT = join(ROOT, 'artifacts', 'visual-qa', 'd13-local')

const GLOBAL_SECTIONS = [
  { id: 'marketing-static', title: 'Marketing/static pages', match: (item) => item.batch === 'marketing-static' },
  { id: 'constructor-3d', title: 'Constructor3D', match: (item) => item.shot.startsWith('constructor-3d') },
  { id: 'webgl-fallback', title: 'WebGL fallback', match: (item) => item.shot === 'constructor-webgl-fallback' },
  { id: 'checkout-shell', title: 'Checkout shell', match: (item) => item.shot === 'constructor-checkout' },
  { id: 'customer-workspace', title: 'Customer workspace', match: (item) => item.shot === 'customer-workspace' },
  { id: 'customer-order-review', title: 'Customer order review', match: (item) => item.shot === 'customer-order-review' },
  { id: 'customer-order-completed', title: 'Customer completed order', match: (item) => item.shot === 'customer-order-completed' },
  { id: 'operations-workspace', title: 'Operations workspace', match: (item) => item.shot === 'operations-workspace' },
  { id: 'operations-review-queue', title: 'Operations review queue', match: (item) => item.shot === 'operations-order-review-queue' },
  { id: 'operations-review-completed', title: 'Operations completed review', match: (item) => item.shot === 'operations-order-review-completed' },
  { id: 'operations-auth', title: 'Operations auth gates', match: (item) => item.batch === 'operations-auth' || item.shot === 'operations-login' },
]

const NON_CLOSURE_REMINDER =
  'This local checklist does not close D-13. Visual closure requires explicit human review result, preview visual QA when preview exists, and required main/GitHub QA/main verification.'

export function buildHumanReviewChecklist(index = buildD13LocalVisualIndex()) {
  const sections = GLOBAL_SECTIONS.map((section) => ({
    ...section,
    shots: index.entries.filter(section.match),
  }))

  const ungrouped = index.entries.filter(
    (item) => !GLOBAL_SECTIONS.some((section) => section.match(item)),
  )
  if (ungrouped.length > 0) {
    sections.push({ id: 'other', title: 'Other indexed shots', shots: ungrouped })
  }

  return {
    generatedAt: index.generatedAt,
    needsHumanReview: true,
    closureClaimed: false,
    nonClosureReminder: NON_CLOSURE_REMINDER,
    sections,
    entries: index.entries,
  }
}

export function renderHumanReviewChecklistMarkdown(checklist) {
  const lines = [
    '# D-13 Human Visual Review Checklist',
    '',
    `Generated: ${checklist.generatedAt}`,
    '',
    '## Review placeholders',
    '',
    '- review status: `[ ] unchecked` / `[ ] pass` / `[ ] issue` / `[ ] blocked`',
    '- severity: `none` / `P0` / `P1` / `P2` / `P3`',
    '- reviewer notes: _add notes here_',
    '',
    '## Non-closure reminder',
    '',
    checklist.nonClosureReminder,
    '',
  ]

  for (const section of checklist.sections) {
    lines.push(`## ${section.title}`, '')
    if (section.shots.length === 0) {
      lines.push('_No indexed shots in this section yet._', '')
      continue
    }
    for (const shot of section.shots) {
      lines.push(
        `### ${shot.shot}`,
        '',
        `- screenshot: \`${shot.pngPath || 'missing'}\``,
        `- route: \`${shot.route || 'unknown'}\``,
        `- viewport: \`${shot.viewport || 'desktop-1440'}\``,
        `- runtime: \`${shot.runtime}\``,
        `- capture status: \`${shot.status}\``,
        `- review status: [ ] unchecked / [ ] pass / [ ] issue / [ ] blocked`,
        `- severity: none / P0 / P1 / P2 / P3`,
        `- reviewer notes:`,
        '',
      )
    }
  }

  lines.push('## Known non-closure reminders', '', `- ${checklist.nonClosureReminder}`)
  return lines.join('\n')
}

function main() {
  const indexPath = join(D13_ROOT, 'index.json')
  const index = existsSync(indexPath)
    ? JSON.parse(readFileSync(indexPath, 'utf8'))
  : buildD13LocalVisualIndex()

  const checklist = buildHumanReviewChecklist(index)
  mkdirSync(D13_ROOT, { recursive: true })
  const outPath = join(D13_ROOT, 'human-review-checklist.md')
  writeFileSync(outPath, renderHumanReviewChecklistMarkdown(checklist))

  console.log(
    JSON.stringify({
      event: 'd13_human_review_checklist',
      outPath: relative(ROOT, outPath).replace(/\\/g, '/'),
      shotCount: checklist.entries.length,
      closureClaimed: false,
    }),
  )
}

if (process.argv[1]?.includes('d13-human-review-checklist.mjs')) {
  main()
}
