#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const errors = []

function read(rel) {
  const path = join(ROOT, rel)
  if (!existsSync(path)) {
    errors.push(`missing required file: ${rel}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

function assertMatch(name, source, pattern, message) {
  if (!pattern.test(source)) {
    errors.push(`${name}: ${message}`)
  }
}

function assertNoMatch(name, source, pattern, message) {
  if (pattern.test(source)) {
    errors.push(`${name}: ${message}`)
  }
}

const governanceDoc = read('docs/planning/local-vs-formal-closure-governance.md')
const backlog = read('docs/planning/current-backlog.md')
const accepted = read('docs/planning/accepted-backlog-decisions-v1.md')
const rpesRecon = read('docs/planning/rpes-local-formal-reconciliation.md')

assertMatch('governance', governanceDoc, /Closed — Local/, 'must define Closed — Local')
assertMatch('governance', governanceDoc, /Closed — Formal/, 'must define Closed — Formal')
assertMatch('governance', governanceDoc, /Closed — Local[\s\S]{0,400}release readiness/i, 'must address release readiness vs Closed — Local')
assertMatch('governance', governanceDoc, /forbid|not release readiness|is not:/i, 'must forbid release readiness conflation')
assertMatch('governance', governanceDoc, /Closed — Local[\s\S]*Closed — Formal/, 'must distinguish local and formal closure')

assertMatch('backlog', backlog, /Local status:/, 'must use Local status language')
assertMatch('backlog', backlog, /Formal status:/, 'must use Formal status language')
assertMatch('backlog', backlog, /Package 13/, 'must reference Package 13 reconciliation')

assertMatch('accepted', accepted, /## 19\. Governance Source Hierarchy/, 'must have §19 governance hierarchy')
assertMatch('accepted', accepted, /local-vs-formal-closure-governance\.md/, 'must reference closure governance doc')

assertMatch('rpes-recon', rpesRecon, /MVP-local compliant/, 'must define MVP-local compliance term')

// D-13 must not be marked closed in backlog Package 13 section
const pkg13 = backlog.match(/### Package 13[\s\S]*?(?=### |$)/)?.[0] ?? backlog
assertNoMatch('backlog-d13', pkg13, /D-13[\s\S]{0,120}Closed — Formal/i, 'D-13 must not be Closed — Formal in Package 13 block')
assertMatch('backlog-d13', pkg13, /D-13[\s\S]{0,200}Deferred by User/i, 'D-13 must remain Deferred by User')

// M9-P1-03 must not claim automatic retry queue in Package 13 block
assertNoMatch('backlog-m9', pkg13, /M9-P1-03[\s\S]{0,240}automatic retry queue implemented/i, 'must not claim automatic retry queue for M9-P1-03')
assertMatch('backlog-m9', pkg13, /M9-P1-03[\s\S]{0,400}manual retry|manual attention/i, 'M9-P1-03 must document manual retry semantics')

// M8-P1-02 must not claim full live verification from RLS alone
assertNoMatch('backlog-m8', backlog, /M8-P1-02[\s\S]{0,400}full live provider verification complete/i, 'M8-P1-02 must not claim full live verification complete')
assertMatch('backlog-m8', backlog, /M8-P1-02[\s\S]{0,600}full live provider|order-flow not executed|does \*\*not\*\* equal full M8-P1-02/i, 'M8-P1-02 must document partial live scope')

// Planning docs: no unqualified release ready in key governance files (allow negated / anti-pattern mentions)
for (const [name, text] of [
  ['backlog-pkg13', pkg13],
  ['rpes-recon', rpesRecon],
]) {
  const positiveReleaseReady = text
    .replace(/not release[- ]ready/gi, '')
    .replace(/no release[- ]ready/gi, '')
    .replace(/release[- ]ready(?!ness)/gi, (m, offset, s) => {
      const before = s.slice(Math.max(0, offset - 40), offset)
      if (/forbid|anti-pattern|⇒|must not|does not/i.test(before)) return ''
      return m
    })
  assertNoMatch(name, positiveReleaseReady, /release[- ]ready(?!ness)/i, 'must not claim unqualified release ready')
}

// Default local workflow must not recommend pre-PR as default (forbidden mentions are OK)
for (const [name, text] of [
  ['accepted-19', accepted],
]) {
  assertNoMatch(name, text, /default local workflow[\s\S]{0,80}pre-PR/i, 'must not use pre-PR as default local workflow term')
}

if (errors.length > 0) {
  console.error('Governance closure wording check failed:')
  for (const err of errors) console.error(`- ${err}`)
  process.exit(1)
}

console.log(JSON.stringify({
  event: 'governance_closure_wording_check',
  ok: true,
  checkedFiles: [
    'docs/planning/local-vs-formal-closure-governance.md',
    'docs/planning/current-backlog.md',
    'docs/planning/accepted-backlog-decisions-v1.md',
    'docs/planning/rpes-local-formal-reconciliation.md',
  ],
}, null, 2))
