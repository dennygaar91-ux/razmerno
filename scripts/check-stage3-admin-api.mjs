import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const [rel, tokens] of [
  ['api/admin/orders.ts', ['validateAdminRequest', 'listAdminOrders', 'applyJsonHeaders']],
  ['api/_shared/admin-auth.ts', ['ADMIN_API_KEY', 'safeCompare', 'Unauthorized']],
  ['api/_shared/admin-orders.ts', ['listAdminOrders', 'maskPhone', 'maskEmail', 'mapOrderRow', 'SUPABASE_SERVICE_ROLE_KEY']],
]) {
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

if (!ok) process.exit(1)
console.log('Stage 3 admin API checks passed.')
