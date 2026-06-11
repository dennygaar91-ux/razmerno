import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['src/configurator/steps.tsx',['TypeDimensionsStep','FillingStep','MaterialsStep','ReviewStep','ActiveStep']],
  ['src/configurator/steps/StepShell.tsx',['StepShell','FieldMessages']],
  ['src/configurator/checkout/CheckoutField.tsx',['CheckoutField']],
  ['src/configurator/checkout/CheckoutSummaryRow.tsx',['CheckoutSummaryRow']],
  ['src/configurator/checkout/CheckoutSuccess.tsx',['CheckoutSuccess']],
  ['src/configurator/store/configSelectors.ts',['selectPrice','selectValidation']],
  ['src/configurator/store/configActions.ts',['createConfigActions','openCheckout']],
  ['vite.config.ts',['react-vendor','three-vendor','supabase-vendor']]
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

const checkout = read('src/configurator/CheckoutDrawer.tsx')
if (checkout.includes('function Field(') || checkout.includes('function SumRow(') || checkout.includes('function SuccessView(')) {
  fail('CheckoutDrawer still owns extracted helpers')
} else {
  pass('CheckoutDrawer no longer owns extracted helpers')
}

if (!ok) process.exit(1)
console.log('Stage 10 constructor architecture final checks passed.')
