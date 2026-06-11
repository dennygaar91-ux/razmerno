import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const checklistPath = path.join(root, 'docs', 'deployment', 'production-release-checklist.md')
let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

if (!fs.existsSync(checklistPath)) {
  fail('production-release-checklist.md is missing')
} else {
  const source = fs.readFileSync(checklistPath, 'utf8')
  const required = [
    'Production release checklist',
    'Env в Vercel',
    'Supabase',
    'Resend / email',
    'Домен / routing',
    'Ручной smoke-test',
    'Checkout',
    'Security',
    'Аналитика',
    'Rollback',
    'Go / No-Go',
  ]

  for (const token of required) {
    if (!source.includes(token)) fail(`checklist missing section: ${token}`)
    else pass(`checklist has section: ${token}`)
  }
}

if (!ok) process.exit(1)
console.log('Production checklist checks passed.')
