import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const [rel,tokens] of [
  ['src/constructor/production/factoryProfile.ts',['default_mvp','maxWidthWithoutReinforcementMm: 600','facadeThicknessMm: 2','otherThicknessMm: 0.8']],
  ['src/constructor/production/manufacturingRules.ts',['SHELF_REINFORCEMENT_REQUIRED','DRAWER_TOO_NARROW','DRAWER_TOO_WIDE','DRAWER_SYNCHRONIZER_REQUIRED','HINGE_COUNT_RULE_APPLIED','FACADE_GAP_RULE_APPLIED']],
  ['src/constructor/production/types.ts',['rules: ManufacturingRulesReport','factoryProfile:']],
  ['src/constructor/production/orderExportPackage.ts',['evaluateManufacturingRules','getDefaultFactoryProfile']],
  ['src/constructor/production/validationReport.ts',['ruleRejects','ruleWarnings']],
  ['tests/manufacturing-rules.test.ts',['Manufacturing rules test passed']]
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
console.log('Stage 14 manufacturing rules checks passed.')
