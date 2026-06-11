import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const helper = read('api/_shared/headers.ts')
for (const token of ['applyNoStoreHeaders', 'X-Content-Type-Options', 'Referrer-Policy', 'applyJsonHeaders']) {
  if (!helper.includes(token)) fail(`headers helper missing ${token}`)
  else pass(`headers helper contains ${token}`)
}

for (const rel of ['api/health.ts', 'api/admin/orders.ts', 'api/admin/order-status.ts', 'api/admin/status-events.ts']) {
  const source = read(rel)
  if (!source.includes('applyJsonHeaders(res)')) fail(`${rel} must use applyJsonHeaders`)
  else pass(`${rel} uses applyJsonHeaders`)
}

const orders = read('api/orders.ts')
if (!orders.includes('applyNoStoreHeaders(res)')) fail('api/orders.ts must use applyNoStoreHeaders')
else pass('api/orders.ts uses applyNoStoreHeaders')

if (!ok) process.exit(1)
console.log('Stage 4 API headers checks passed.')
