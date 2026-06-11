import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const [rel,tokens] of [
  ['src/configurator/context.tsx',['facadeMaterialKind','SET_FACADE_MATERIAL_KIND']],
  ['src/configurator/steps/MaterialsStep.tsx',['Тип фасада','ЛДСП','МДФ','facade-kind']],
  ['src/configurator/CheckoutDrawer.tsx',['facadeKind: state.facadeMaterialKind']],
  ['src/shared/lib/order.ts',['facadeKind?: "ldsp" | "mdf"']],
  ['api/_shared/order-types.ts',['facadeKind?: "ldsp" | "mdf"']],
  ['src/constructor/production/orderExportPackage.ts',['const facadeKind','facadeThicknessMm']],
  ['src/constructor/geometry/fromConfigState.ts',['facadeMaterialKind','MDF_FACADE_THICKNESS_MM']]
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
console.log('Stage 15 facade material choice checks passed.')
