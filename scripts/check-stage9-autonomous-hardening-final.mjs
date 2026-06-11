import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['api/_shared/admin-auth.ts',['ADMIN_PASSWORD_HASH','hashAdminPassword']],
  ['api/_shared/rate-limit.ts',['RateLimitAdapter','checkRateLimit']],
  ['api/_shared/errors.ts',['ApiError','RateLimitError','sendApiError']],
  ['api/_shared/events.ts',['ApiEvents','adminLoginSuccess']],
  ['scripts/check-architecture-consistency.mjs',['VITE_ADMIN_ACCESS_KEY','Собрать набор','allowedUseConfigFiles']],
  ['docs/production/PRODUCTION-HANDBOOK.md',['ADMIN_PASSWORD_HASH','npm run qa:stage9']],
  ['docs/architecture/zustand-migration-plan.md',['Provider removal']]
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

if (read('.env.production.example').includes('ADMIN_LOGIN_PASSWORD')) fail('env still contains ADMIN_LOGIN_PASSWORD')
else pass('env removed ADMIN_LOGIN_PASSWORD')
if (!read('.env.production.example').includes('ADMIN_PASSWORD_HASH=')) fail('env missing ADMIN_PASSWORD_HASH')
else pass('env contains ADMIN_PASSWORD_HASH')

if (!ok) process.exit(1)
console.log('Stage 9 autonomous hardening final checks passed.')
