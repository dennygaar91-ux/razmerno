import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const [rel, tokens] of [
  ['supabase/migrations/20260526_add_order_status_events.sql', ['order_status_events', 'from_status', 'to_status', 'changed_by']],
  ['api/_shared/admin-orders.ts', ['fromStatus', 'order_status_events', 'changed_by', 'updateAdminOrderStatus(orderId: string, status: AdminOrderStatus, changedBy']],
  ['api/admin/order-status.ts', ["updateAdminOrderStatus(orderId, body.status, 'admin')"]],
  ['docs/production/admin-status-audit.md', ['Admin status audit trail', 'changed_by']],
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
console.log('Stage 3 status audit checks passed.')
