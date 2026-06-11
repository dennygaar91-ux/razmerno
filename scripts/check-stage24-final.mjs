import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

const checks = [
  ['src/configurator/checkout/useCheckoutSubmit.ts',['useCheckoutSubmit','submitOrder','buildCheckoutOrderPayload']],
  ['src/configurator/CheckoutDrawer.tsx',['useCheckoutSubmit']],
  ['tests/checkout-submit-hook.test.ts',['Checkout submit hook test passed']],
  ['scripts/check-stage24-legacy-config-usage.mjs',['useConfig() remains only in allowed compatibility/test files']],
  ['docs/BACKLOG.md',['Stage 24 / Constructor state cleanup remaining']],
  ['docs/history/STAGE_24_FINAL_REPORT.md',['Constructor State Cleanup','Scope verification']]
]

for (const [rel,tokens] of checks) {
  if (!fs.existsSync(path.join(root, rel))) { fail(`${rel} missing`); continue }
  const source=read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

const drawer = read('src/configurator/CheckoutDrawer.tsx')
if (drawer.includes('submitOrder(') || drawer.includes('buildCheckoutOrderPayload(')) {
  fail('CheckoutDrawer still owns submit orchestration')
} else {
  pass('CheckoutDrawer delegates submit orchestration')
}

if (!ok) process.exit(1)
console.log('Stage 24 final checks passed.')
