import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }
for (const [rel,tokens] of [
  ['api/_shared/rate-limit.ts',['ADMIN_LOGIN_RATE_LIMIT','checkMemoryRateLimit','getClientIpHash','limit: 5','windowMs: 1000 * 60 * 10']],
  ['api/admin/login.ts',['checkMemoryRateLimit','admin.login_rate_limited','429','X-RateLimit-Limit','Retry-After']]
]) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) { fail(`${rel} missing`); continue }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 8 admin login rate-limit checks passed.')
