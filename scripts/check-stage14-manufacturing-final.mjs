import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['src/constructor/production/factoryProfile.ts',['default_mvp','maxWidthWithoutReinforcementMm: 600','facadeThicknessMm: 2']],
  ['src/constructor/production/manufacturingRules.ts',['auto-warning','auto-reject','auto-repair','DRAWER_SYNCHRONIZER_REQUIRED','HINGE_COUNT_RULE_APPLIED']],
  ['src/constructor/production/revisions.ts',['ProductionRevision','createInitialProductionRevision','createManualProductionRevision']],
  ['src/constructor/production/types.ts',['rules: ManufacturingRulesReport','revisions: ProductionRevision[]','review:']],
  ['src/constructor/production/orderExportPackage.ts',['evaluateManufacturingRules','createInitialProductionRevision','manualChangesAllowed']],
  ['src/constructor/production/validationReport.ts',['ruleRejects','ruleWarnings']],
  ['api/_shared/admin-orders.ts',['productionSummary','production_export']],
  ['src/admin/AdminOrdersPage.tsx',['productionStatus','Проф. проверка / ручные правки']],
  ['tests/manufacturing-rules.test.ts',['Manufacturing rules test passed']]
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
console.log('Stage 14 manufacturing final checks passed.')
