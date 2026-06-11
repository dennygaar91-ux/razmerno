import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const contracts = [
  {
    rel: 'api/admin/orders.ts',
    must: ['GET', 'OPTIONS', 'validateAdminRequest', 'listAdminOrders', '{ ok: true, orders }', 'Unable to load orders'],
    mustNot: ['customer_phone', 'customer_email', 'customer_name'],
  },
  {
    rel: 'api/admin/order-status.ts',
    must: ['PATCH', 'OPTIONS', 'Invalid orderId', 'Invalid status', 'updateAdminOrderStatus'],
    mustNot: ['customer_phone', 'customer_email'],
  },
  {
    rel: 'api/admin/status-events.ts',
    must: ['GET', 'OPTIONS', 'listAdminStatusEvents', '{ ok: true, events }', 'Unable to load status events'],
    mustNot: ['customer_phone', 'customer_email'],
  },
]

for (const contract of contracts) {
  const file = path.join(root, contract.rel)
  if (!fs.existsSync(file)) {
    fail(`${contract.rel} missing`)
    continue
  }

  const source = read(contract.rel)
  for (const token of contract.must) {
    if (!source.includes(token)) fail(`${contract.rel} missing required token ${token}`)
    else pass(`${contract.rel} contains ${token}`)
  }

  for (const token of contract.mustNot) {
    if (source.includes(token)) fail(`${contract.rel} exposes forbidden token ${token}`)
    else pass(`${contract.rel} does not expose ${token}`)
  }
}

if (!ok) process.exit(1)
console.log('Stage 3 admin API contract checks passed.')
