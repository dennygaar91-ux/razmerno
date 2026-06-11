import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const [rel,tokens] of [
  ['src/configurator/checkout/buildCheckoutOrderPayload.ts',['buildCheckoutOrderPayload','facadeKind','priceBreakdown']],
  ['src/configurator/CheckoutDrawer.tsx',['useConfigBridge','buildCheckoutOrderPayload','actions.setOrderId']],
  ['src/configurator/store/configActions.ts',['setOrderId']],
  ['tests/checkout-payload.test.ts',['Checkout payload test passed']]
]) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) { fail(`${rel} missing`); continue }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
if (read('src/configurator/CheckoutDrawer.tsx').includes('useConfig(')) fail('CheckoutDrawer still calls useConfig')
else pass('CheckoutDrawer no longer calls useConfig')
if (!ok) process.exit(1)
console.log('Stage 21 checkout payload checks passed.')
