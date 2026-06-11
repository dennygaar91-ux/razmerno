import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }
const rate = read('api/_shared/rate-limit.ts')
for (const token of ['RateLimitAdapter','memoryRateLimitAdapter','getRateLimitAdapter','checkRateLimit','hasUpstashEnv','adapter:']) {
  if (!rate.includes(token)) fail(`rate-limit missing ${token}`)
  else pass(`rate-limit contains ${token}`)
}
const login = read('api/admin/login.ts')
if (!login.includes('await checkRateLimit')) fail('login must use await checkRateLimit')
else pass('login uses await checkRateLimit')
if (!ok) process.exit(1)
console.log('Stage 9 rate-limit abstraction checks passed.')
