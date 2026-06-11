import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }
const events = read('api/_shared/events.ts')
for (const token of ['ApiEvents','adminLoginSuccess','adminLoginRateLimited','orderCreateSucceeded','emailCustomerFailed']) {
  if (!events.includes(token)) fail(`events missing ${token}`)
  else pass(`events contains ${token}`)
}
for (const rel of ['api/admin/login.ts','api/_shared/admin-auth.ts','api/diagnostics.ts','api/health.ts']) {
  const source=read(rel)
  if (!source.includes('ApiEvents')) fail(`${rel} must import/use ApiEvents`)
  else pass(`${rel} uses ApiEvents`)
}
if (!ok) process.exit(1)
console.log('Stage 9 event taxonomy checks passed.')
