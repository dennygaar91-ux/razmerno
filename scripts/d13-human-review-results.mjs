#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const D13_ROOT = join(ROOT, 'artifacts', 'visual-qa', 'd13-local')

const DEFAULT_INPUT = join(D13_ROOT, 'human-review-checklist.canonical.md')

export const REVIEW_STATUSES = ['unchecked', 'pass', 'issue', 'blocked']
export const SEVERITIES = ['none', 'P0', 'P1', 'P2', 'P3']

export function parseHumanReviewArgs(argv = process.argv.slice(2)) {
  let input = DEFAULT_INPUT
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--input' && argv[index + 1]) {
      input = argv[index + 1]
      index += 1
    }
  }
  return { input }
}

export function parseReviewStatus(line) {
  const normalized = line.toLowerCase()
  if (/\[x\]\s*pass|review status:\s*pass\b/.test(normalized)) return 'pass'
  if (/\[x\]\s*issue|review status:\s*issue\b/.test(normalized)) return 'issue'
  if (/\[x\]\s*blocked|review status:\s*blocked\b/.test(normalized)) return 'blocked'
  if (/\[x\]\s*unchecked|review status:\s*unchecked\b/.test(normalized)) return 'unchecked'
  return 'unchecked'
}

export function parseSeverity(line) {
  const match = line.match(/\b(P0|P1|P2|P3)\b/i)
  if (match) return match[1].toUpperCase()
  if (/severity:\s*none/i.test(line)) return 'none'
  return 'none'
}

export function parseHumanReviewChecklist(markdown) {
  const lines = markdown.split(/\r?\n/)
  const shots = []
  let current = null
  let notes = []

  for (const line of lines) {
    const heading = line.match(/^###\s+(.+)$/)
    if (heading) {
      if (current) {
        shots.push({ ...current, reviewerNotes: notes.join('\n').trim() })
      }
      current = {
        shot: heading[1].trim(),
        screenshotPath: null,
        route: null,
        viewport: null,
        runtime: null,
        captureStatus: null,
        reviewStatus: 'unchecked',
        severity: 'none',
      }
      notes = []
      continue
    }

    if (!current) continue

    const screenshot = line.match(/^- screenshot:\s*`([^`]+)`/)
    if (screenshot) {
      current.screenshotPath = screenshot[1]
      continue
    }

    const route = line.match(/^- route:\s*`([^`]+)`/)
    if (route) {
      current.route = route[1]
      continue
    }

    const viewport = line.match(/^- viewport:\s*`([^`]+)`/)
    if (viewport) {
      current.viewport = viewport[1]
      continue
    }

    const runtime = line.match(/^- runtime:\s*`([^`]+)`/)
    if (runtime) {
      current.runtime = runtime[1]
      continue
    }

    const captureStatus = line.match(/^- capture status:\s*`([^`]+)`/)
    if (captureStatus) {
      current.captureStatus = captureStatus[1]
      continue
    }

    if (line.includes('review status:')) {
      current.reviewStatus = parseReviewStatus(line)
      continue
    }

    if (line.includes('severity:')) {
      current.severity = parseSeverity(line)
      continue
    }

    if (line.startsWith('- reviewer notes:')) {
      const inline = line.replace(/^- reviewer notes:\s*/, '').trim()
      if (inline) notes.push(inline)
      continue
    }

    if (notes.length > 0 || (line.trim() && !line.startsWith('- '))) {
      notes.push(line)
    }
  }

  if (current) {
    shots.push({ ...current, reviewerNotes: notes.join('\n').trim() })
  }

  return shots
}

export function summarizeHumanReviewResults(shots, options = {}) {
  const counts = {
    total: shots.length,
    unchecked: 0,
    pass: 0,
    issue: 0,
    blocked: 0,
    P0: 0,
    P1: 0,
    P2: 0,
    P3: 0,
    none: 0,
  }

  for (const shot of shots) {
    counts[shot.reviewStatus] = (counts[shot.reviewStatus] || 0) + 1
    if (shot.severity && counts[shot.severity] !== undefined) {
      counts[shot.severity] += 1
    }
  }

  const allPass = shots.length > 0 && shots.every((shot) => shot.reviewStatus === 'pass')
  const closureEligible =
    allPass &&
    options.remotePreviewVisualQa === true &&
    options.humanApprovalMetadata === true &&
    options.mainGithubQa === true

  return {
    generatedAt: new Date().toISOString(),
    sourceInput: options.sourceInput || null,
    shots,
    summary: counts,
    closureEligible,
    closureClaimed: false,
    d13Closed: false,
    nonClosureReminder:
      'Local human review results alone do not close D-13. Remote preview visual QA, explicit human approval metadata, and main/GitHub QA verification are still required.',
  }
}

export function renderHumanReviewResultsMarkdown(results) {
  const lines = [
    '# D-13 Human Review Results',
    '',
    `Generated: ${results.generatedAt}`,
    '',
    `Source: \`${results.sourceInput || 'unknown'}\``,
    '',
    '## Summary',
    '',
    `- total shots: ${results.summary.total}`,
    `- unchecked: ${results.summary.unchecked}`,
    `- pass: ${results.summary.pass}`,
    `- issue: ${results.summary.issue}`,
    `- blocked: ${results.summary.blocked}`,
    `- P0: ${results.summary.P0}`,
    `- P1: ${results.summary.P1}`,
    `- P2: ${results.summary.P2}`,
    `- P3: ${results.summary.P3}`,
    `- closureEligible: ${results.closureEligible}`,
    `- d13Closed: ${results.d13Closed}`,
    '',
    '## Non-closure',
    '',
    results.nonClosureReminder,
    '',
  ]

  for (const shot of results.shots) {
    lines.push(
      `### ${shot.shot}`,
      '',
      `- review status: ${shot.reviewStatus}`,
      `- severity: ${shot.severity}`,
      `- reviewer notes: ${shot.reviewerNotes || ''}`,
      '',
    )
  }

  return lines.join('\n')
}

export function buildHumanReviewResultsFromMarkdown(markdown, options = {}) {
  const shots = parseHumanReviewChecklist(markdown)
  return summarizeHumanReviewResults(shots, options)
}

export function writeHumanReviewResultsArtifacts(results) {
  mkdirSync(D13_ROOT, { recursive: true })
  const jsonPath = join(D13_ROOT, 'human-review-results.json')
  const mdPath = join(D13_ROOT, 'human-review-results.md')
  writeFileSync(jsonPath, JSON.stringify(results, null, 2))
  writeFileSync(mdPath, renderHumanReviewResultsMarkdown(results))
  return {
    jsonPath: relative(ROOT, jsonPath).replace(/\\/g, '/'),
    mdPath: relative(ROOT, mdPath).replace(/\\/g, '/'),
  }
}

function main() {
  const args = parseHumanReviewArgs()
  if (!existsSync(args.input)) {
    console.error(JSON.stringify({ event: 'd13_human_review_results_error', message: `Input not found: ${args.input}` }))
    process.exit(1)
  }

  const markdown = readFileSync(args.input, 'utf8')
  const results = buildHumanReviewResultsFromMarkdown(markdown, { sourceInput: relative(ROOT, args.input).replace(/\\/g, '/') })
  const paths = writeHumanReviewResultsArtifacts(results)

  console.log(
    JSON.stringify({
      event: 'd13_human_review_results',
      ...paths,
      total: results.summary.total,
      unchecked: results.summary.unchecked,
      closureEligible: results.closureEligible,
      d13Closed: results.d13Closed,
    }),
  )
}

if (process.argv[1]?.includes('d13-human-review-results.mjs')) {
  main()
}
