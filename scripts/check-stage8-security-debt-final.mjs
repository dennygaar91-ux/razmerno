import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['api/_shared/rate-limit.ts',['ADMIN_LOGIN_RATE_LIMIT','checkMemoryRateLimit']],
  ['api/admin/login.ts',['admin.login_rate_limited','429','Retry-After']],
  ['src/components/Support.tsx',['Открыть конструктор']],
  ['src/configurator/PriceCard.tsx',['Открыть заявку']],
  ['docs/architecture/zustand-migration-plan.md',['Zustand migration plan','Provider removal']],
  ['docs/production/admin-auth-v2.md',['ADMIN_LOGIN_PASSWORD']]
]
for (const [rel,tokens] of checks) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) { fail(`${rel} missing`); continue }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

for (const rel of ['src/components/Support.tsx','src/configurator/PriceCard.tsx']) {
  if (read(rel).includes('Собрать набор')) fail(`${rel} still contains legacy CTA`)
  else pass(`${rel} has no legacy CTA`)
}

if (read('.env.production.example').includes('VITE_ADMIN_ACCESS_KEY')) fail('env contains legacy VITE_ADMIN_ACCESS_KEY')
else pass('env has no legacy VITE_ADMIN_ACCESS_KEY')

if (!ok) process.exit(1)
console.log('Stage 8 security debt final checks passed.')
