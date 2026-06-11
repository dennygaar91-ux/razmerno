import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const [rel,tokens] of [
  ['src/admin/types.ts',['AdminOrderRow','AdminProductionDetail','ProductionReviewStatus']],
  ['src/admin/api.ts',['fetchAdminOrders','loadProductionDetail','updateProductionReview']],
  ['src/admin/format.ts',['mapApiOrder','formatPrice','formatDate']],
  ['src/admin/ProductionReviewPanel.tsx',['ProductionReviewPanel','ProductionDetailBreakdown','ProductionMiniTable']],
  ['src/admin/AdminOrdersPage.tsx',['ProductionReviewPanel','fetchAdminOrders','mapApiOrder']]
]) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) { fail(`${rel} missing`); continue }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 18 admin decomposition checks passed.')
