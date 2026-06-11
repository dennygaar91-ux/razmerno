import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const [rel, tokens] of [
  ['api/admin/order-status.ts', ['PATCH', 'validateAdminRequest', 'updateAdminOrderStatus', 'Invalid status', 'Invalid orderId']],
  ['api/_shared/admin-orders.ts', ['updateAdminOrderStatus', 'isAdminOrderStatus', '.update({ status })']],
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
console.log('Stage 3 admin status API checks passed.')
