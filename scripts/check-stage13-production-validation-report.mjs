import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }
for (const [rel,tokens] of [
  ['src/constructor/production/validationReport.ts',['ProductionValidationReport','ready-for-review','blocked','basisSteps']],
  ['src/constructor/production/types.ts',['validation:','razmerno.production-validation.v1']],
  ['src/constructor/production/orderExportPackage.ts',['buildProductionValidationReport','validation:']],
  ['tests/production-export.test.ts',['production-validation','validation.summary.panels']]
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
console.log('Stage 13 production validation report checks passed.')
