import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

for (const [rel,tokens] of [
  ['src/configurator/checkout/CheckoutDeliveryBlock.tsx',['export function CheckoutDeliveryBlock','CheckoutField','deliveryAddress']],
  ['src/configurator/checkout/CheckoutAssemblyBlock.tsx',['export function CheckoutAssemblyBlock','Заказать сборку']],
  ['src/configurator/CheckoutDrawer.tsx',['CheckoutDeliveryBlock','CheckoutAssemblyBlock']]
]) {
  const source=read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
const drawer=read('src/configurator/CheckoutDrawer.tsx')
if (drawer.includes('Внутри МКАД') || drawer.includes('+10% от стоимости шкафа')) fail('CheckoutDrawer still owns services copy')
else pass('CheckoutDrawer no longer owns services copy')
if (!ok) process.exit(1)
console.log('Stage 25 checkout services blocks checks passed.')
