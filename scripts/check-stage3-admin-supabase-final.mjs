import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['api/admin/orders.ts', ['listAdminOrders', 'validateAdminRequest']],
  ['api/admin/order-status.ts', ['updateAdminOrderStatus', 'Invalid status']],
  ['api/admin/status-events.ts', ['listAdminStatusEvents']],
  ['api/_shared/admin-orders.ts', ['maskPhone', 'updateAdminOrderStatus', 'listAdminStatusEvents']],
  ['src/admin/AdminOrdersPage.tsx', ['ADMIN_API_URL', 'ADMIN_STATUS_API_URL', 'ADMIN_STATUS_EVENTS_API_URL']],
  ['supabase/migrations/20260526_add_order_status_events.sql', ['order_status_events']],
  ['docs/history/STAGE_03_FINAL_REPORT.md', ['Stage 3 Final Report', 'Scope verification']],
]

for (const [rel, tokens] of checks) {
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

const pkg = JSON.parse(read('package.json'))
for (const script of ['qa:stage3', 'check:stage3-admin-supabase-final']) {
  if (!pkg.scripts?.[script]) fail(`package script missing ${script}`)
  else pass(`package script exists ${script}`)
}

if (!ok) process.exit(1)
console.log('Stage 3 final checks passed.')
