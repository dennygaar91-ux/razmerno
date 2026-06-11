import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

for (const [rel,tokens] of [
  ['src/configurator/checkout/CheckoutOrderSummary.tsx',['export function CheckoutOrderSummary','CheckoutSummaryRow','checkoutTotal']],
  ['src/configurator/checkout/CheckoutNextSteps.tsx',['export function CheckoutNextSteps','Оплата сейчас не требуется','менеджер сверит детали']],
  ['src/configurator/CheckoutDrawer.tsx',['CheckoutOrderSummary','CheckoutNextSteps']]
]) {
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
const drawer = read('src/configurator/CheckoutDrawer.tsx')
if (drawer.includes('Оплата сейчас не требуется') || drawer.includes('Что будет после заявки')) fail('CheckoutDrawer still owns next steps copy')
else pass('CheckoutDrawer no longer owns next steps copy')
if (!ok) process.exit(1)
console.log('Stage 25 checkout summary split checks passed.')
