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

const scriptPath = path.join(root, 'scripts/live-manual-pricing-draft-verify.mjs')
if (!fs.existsSync(scriptPath)) {
  fail('scripts/live-manual-pricing-draft-verify.mjs missing')
} else {
  pass('live manual pricing draft verify script exists')
  const source = fs.readFileSync(scriptPath, 'utf8')
  for (const token of [
    'order_manual_pricing_drafts',
    'SUPABASE_SERVICE_ROLE_KEY',
    'manual-pricing-draft',
    'production_export',
    'price_breakdown',
    'loadProjectEnvFiles',
    'getEnvPresenceReport',
    'loadedEnvFiles',
    'envPresence',
  ]) {
    if (!source.includes(token)) fail(`verify script missing token ${token}`)
    else pass(`verify script contains ${token}`)
  }
}

const loaderPath = path.join(root, 'scripts/load-project-env.mjs')
if (!fs.existsSync(loaderPath)) {
  fail('scripts/load-project-env.mjs missing')
} else {
  pass('load-project-env helper exists')
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
if (!pkg.scripts?.['verify:live-manual-pricing-draft']) {
  fail('package script verify:live-manual-pricing-draft missing')
} else {
  pass('package script verify:live-manual-pricing-draft exists')
}

if (!ok) process.exit(1)
console.log('Live manual pricing draft verify runbook checks passed.')
