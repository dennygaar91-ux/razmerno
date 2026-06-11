import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }
for (const [rel,tokens] of [
  ['src/constructor/production/orderExportPackage.ts',['buildProductionExportFromOrder','manual-json-ready','requiresTechnologistCheck']],
  ['src/constructor/production/types.ts',['ProductionExportPackage'],],
  ['api/orders.ts',['buildProductionExportFromOrder','productionExport']],
  ['api/_shared/order-db.ts',['production_export']],
  ['api/_shared/order-types.ts',['productionExport','production_export']],
  ['supabase/migrations/20260527_add_order_production_export.sql',['production_export jsonb']],
  ['tests/production-export.test.ts',['Production export package test passed']]
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
console.log('Stage 13 production export checks passed.')
