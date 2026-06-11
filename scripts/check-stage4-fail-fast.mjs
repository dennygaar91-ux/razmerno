import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const orders = read('api/orders.ts')
for (const token of ['assertServerEnvReady', 'orders.env_not_ready', 'Service is not configured', '503']) {
  if (!orders.includes(token)) fail(`orders.ts missing ${token}`)
  else pass(`orders.ts contains ${token}`)
}

const auth = read('api/_shared/admin-auth.ts')
if (auth.includes('process.env.VITE_ADMIN_ACCESS_KEY')) fail('admin server auth must not use VITE_ADMIN_ACCESS_KEY fallback')
else pass('admin server auth does not use frontend env fallback')
if (!auth.includes('process.env.ADMIN_API_KEY')) fail('admin server auth must use ADMIN_API_KEY')
else pass('admin server auth uses ADMIN_API_KEY')

if (!ok) process.exit(1)
console.log('Stage 4 fail-fast checks passed.')
