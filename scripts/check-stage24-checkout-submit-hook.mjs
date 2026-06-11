import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const hook = read('src/configurator/checkout/useCheckoutSubmit.ts')
for (const token of ['useCheckoutSubmit','submitOrder','buildCheckoutOrderPayload','validateCustomer','validateDelivery','validateAssembly']) {
  if (!hook.includes(token)) fail(`useCheckoutSubmit missing ${token}`)
  else pass(`useCheckoutSubmit contains ${token}`)
}

const drawer = read('src/configurator/CheckoutDrawer.tsx')
if (!drawer.includes('useCheckoutSubmit')) fail('CheckoutDrawer missing useCheckoutSubmit')
else pass('CheckoutDrawer uses useCheckoutSubmit')
if (drawer.includes('submitOrder(') || drawer.includes('buildCheckoutOrderPayload(')) fail('CheckoutDrawer still owns submit payload orchestration')
else pass('CheckoutDrawer no longer owns submit payload orchestration')

if (!ok) process.exit(1)
console.log('Stage 24 checkout submit hook checks passed.')
