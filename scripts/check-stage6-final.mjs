import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

function exists(rel) {
  const full = path.join(root, rel)
  if (!fs.existsSync(full)) fail(`${rel} is missing`)
  else pass(`${rel} exists`)
}

function scriptExists(name) {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  if (!pkg.scripts?.[name]) fail(`package script is missing: ${name}`)
  else pass(`package script exists: ${name}`)
}

if (fs.existsSync(path.join(root, 'server'))) fail('/server directory must not exist')
else pass('/server directory is absent')

exists('docs/history')
exists('docs/deployment/production-release-checklist.md')
exists('docs/deployment/production-preflight.md')
exists('docs/deployment/env-production.md')
exists('docs/deployment/bundle-budget.md')
exists('docs/security/order-security.md')
exists('docs/architecture/routing.md')
exists('docs/history/STAGE_06_FINAL_STATUS.md')

for (const name of [
  'production:preflight',
  'check:no-server',
  'check:root-docs',
  'check:legacy-runtime-imports',
  'check:normal-urls',
  'check:production-env',
  'check:order-security',
  'check:production-checklist',
  'check:bundle-budget',
]) {
  scriptExists(name)
}

if (!ok) process.exit(1)
console.log('Stage 6 final checks passed.')
