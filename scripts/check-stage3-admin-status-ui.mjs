import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const source = fs.readFileSync(path.join(root, 'src', 'admin', 'AdminOrdersPage.tsx'), 'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

for (const token of [
  'ADMIN_STATUS_API_URL',
  '/api/admin/order-status',
  'updateOrderStatus',
  'handleStatusChange',
  'statusUpdatingId',
  'demo readonly',
  '<select',
]) {
  if (!source.includes(token)) fail(`Admin status UI missing ${token}`)
  else pass(`Admin status UI contains ${token}`)
}

if (!ok) process.exit(1)
console.log('Stage 3 admin status UI checks passed.')
