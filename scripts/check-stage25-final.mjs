import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

const components = [
  'CheckoutOrderSummary',
  'CheckoutNextSteps',
  'CheckoutContactForm',
  'CheckoutDeliveryBlock',
  'CheckoutAssemblyBlock',
  'CheckoutSubmitBlock',
]

for (const name of components) {
  const rel = `src/configurator/checkout/${name}.tsx`
  if (!fs.existsSync(path.join(root, rel))) {
    fail(`${rel} missing`)
    continue
  }
  const source = read(rel)
  if (!source.includes(`export function ${name}`)) fail(`${rel} missing export`)
  else pass(`${rel} exports ${name}`)
}

const drawer = read('src/configurator/CheckoutDrawer.tsx')
for (const name of components) {
  if (!drawer.includes(name)) fail(`CheckoutDrawer missing ${name}`)
  else pass(`CheckoutDrawer uses ${name}`)
}

const lineCount = drawer.split('\n').length
if (lineCount > 220) fail(`CheckoutDrawer still too large: ${lineCount}`)
else pass(`CheckoutDrawer line count improved: ${lineCount}`)

if (drawer.includes('submitOrder(') || drawer.includes('buildCheckoutOrderPayload(')) {
  fail('CheckoutDrawer owns submit orchestration')
} else {
  pass('CheckoutDrawer keeps submit orchestration delegated')
}

if (!read('docs/history/STAGE_25_FINAL_REPORT.md').includes('Scope verification')) fail('final report missing scope verification')
else pass('final report contains scope verification')

if (!ok) process.exit(1)
console.log('Stage 25 final checks passed.')
