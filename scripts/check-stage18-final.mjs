import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['src/admin/types.ts',['AdminOrderRow','AdminProductionDetail']],
  ['src/admin/api.ts',['fetchAdminOrders','loadProductionDetail']],
  ['src/admin/format.ts',['mapApiOrder']],
  ['src/admin/ProductionReviewPanel.tsx',['export function ProductionReviewPanel','ProductionDetailBreakdown']],
  ['src/admin/AdminOrderDetailPage.tsx',['AdminOrderDetailPage','ProductionReviewPanel']],
  ['src/admin/AdminOrdersPage.tsx',['AdminOrderDetailPage','fetchAdminOrders']]
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
console.log('Stage 18 final checks passed.')
