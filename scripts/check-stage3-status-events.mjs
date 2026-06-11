import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const [rel, tokens] of [
  ['api/admin/status-events.ts', ['listAdminStatusEvents', 'GET', 'validateAdminRequest']],
  ['api/_shared/admin-orders.ts', ['AdminStatusEvent', 'listAdminStatusEvents', 'mapStatusEvent']],
  ['src/admin/AdminOrdersPage.tsx', ['ADMIN_STATUS_EVENTS_API_URL', 'loadStatusEvents', 'Последние изменения статусов', 'statusEvents']],
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
console.log('Stage 3 status events checks passed.')
