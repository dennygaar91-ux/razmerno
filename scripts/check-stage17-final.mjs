import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['api/orders.ts',['buildProductionEmailAttachments','buildManagerAttachments','ResendAttachment']],
  ['tests/email-attachments.test.ts',['Email attachments foundation test passed']],
  ['src/App.tsx',['routePath={route.pathname}']],
  ['src/admin/AdminOrdersPage.tsx',['routeOrderId','Детальная заявка','Открыть detail','/admin/orders/']],
  ['docs/history/STAGE_17_TASK_01_MANAGER_EMAIL_ATTACHMENTS.md',['Backlog']],
  ['docs/history/STAGE_17_TASK_02_ADMIN_ORDER_DETAIL_ROUTE.md',['Backlog']]
]

for (const [rel,tokens] of checks) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) { fail(`${rel} missing`); continue }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 17 final checks passed.')
