import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['api/health.ts', ['getServerEnvReport', 'razmerno-api', 'applyJsonHeaders']],
  ['api/_shared/env.ts', ['REQUIRED_SERVER_ENV', 'ADMIN_API_KEY', 'assertServerEnvReady']],
  ['api/_shared/headers.ts', ['X-Content-Type-Options', 'Referrer-Policy']],
  ['api/orders.ts', ['orders.env_not_ready', 'Service is not configured']],
  ['api/_shared/admin-auth.ts', ['process.env.ADMIN_API_KEY']],
  ['scripts/deploy-smoke.mjs', ['SMOKE_BASE_URL', '/api/health']],
  ['scripts/predeploy-guard.mjs', ['Predeploy guard passed']],
  ['public/robots.txt', ['Disallow: /admin', 'Disallow: /api/admin']],
  ['public/sitemap.xml', ['https://razmerno.ru/configurator']],
  ['docs/production/vercel-deploy-runbook.md', ['Post-deploy smoke', 'Rollback']],
  ['docs/production/stage4-deploy-readiness.md', ['Stop deploy if']],
  ['docs/history/STAGE_04_TASK_09_FINAL_SCOPE.md', ['Final scope verification']],
]

for (const [rel, tokens] of checks) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) {
    fail(`${rel} missing`)
    continue
  }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

const pkg = JSON.parse(read('package.json'))
for (const script of ['qa:stage4', 'smoke:deploy', 'predeploy:guard', 'check:stage4-production-deploy-final']) {
  if (!pkg.scripts?.[script]) fail(`package script missing ${script}`)
  else pass(`package script exists ${script}`)
}

if (!ok) process.exit(1)
console.log('Stage 4 production deploy final checks passed.')
