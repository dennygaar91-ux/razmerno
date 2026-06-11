import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['src/constructor/production/orderExportPackage.ts',['buildProductionExportFromOrder','buildProductionExportPackage','manual-json-ready']],
  ['src/constructor/production/exportPackage.ts',['buildProductionExportFromConfigState']],
  ['src/constructor/production/validationReport.ts',['ProductionValidationReport','ready-for-review','basisSteps']],
  ['src/constructor/production/types.ts',['ProductionExportPackage','validation:']],
  ['api/orders.ts',['buildProductionExportFromOrder','productionExport']],
  ['api/_shared/order-db.ts',['production_export']],
  ['supabase/migrations/20260527_add_order_production_export.sql',['production_export jsonb']],
  ['tests/production-export.test.ts',['Production export package test passed','production-validation']]
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

const api = read('api/orders.ts')
if (api.includes("from '../src/constructor/production'")) {
  fail('api/orders must not import production index because it can pull frontend context')
} else {
  pass('api/orders imports server-safe production module')
}

if (!ok) process.exit(1)
console.log('Stage 13 production logic final checks passed.')
