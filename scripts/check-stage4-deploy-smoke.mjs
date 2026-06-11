import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const file = path.join(root, 'scripts', 'deploy-smoke.mjs')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

if (!fs.existsSync(file)) fail('deploy-smoke.mjs missing')
else {
  const source = fs.readFileSync(file, 'utf8')
  for (const token of ['SMOKE_BASE_URL', '/api/health', '/api/admin/orders?limit=5', 'ADMIN_API_KEY', 'Admin orders should not be open without key']) {
    if (!source.includes(token)) fail(`deploy smoke missing ${token}`)
    else pass(`deploy smoke contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 4 deploy smoke checks passed.')
