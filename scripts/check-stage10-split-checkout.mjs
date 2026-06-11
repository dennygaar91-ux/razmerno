import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
const files = [
  'src/configurator/checkout/CheckoutField.tsx',
  'src/configurator/checkout/CheckoutSummaryRow.tsx',
  'src/configurator/checkout/CheckoutSuccess.tsx',
]
for (const rel of files) {
  if (!fs.existsSync(path.join(root, rel))) fail(`${rel} missing`)
  else pass(`${rel} exists`)
}
const drawer = fs.readFileSync(path.join(root, 'src/configurator/CheckoutDrawer.tsx'), 'utf8')
for (const token of ['CheckoutField','CheckoutSummaryRow','CheckoutSuccess']) {
  if (!drawer.includes(token)) fail(`CheckoutDrawer missing ${token}`)
  else pass(`CheckoutDrawer uses ${token}`)
}
if (drawer.includes('function Field(') || drawer.includes('function SumRow(') || drawer.includes('function SuccessView(')) {
  fail('CheckoutDrawer still contains extracted helper functions')
} else {
  pass('CheckoutDrawer extracted helper functions')
}
if (!ok) process.exit(1)
console.log('Stage 10 split checkout checks passed.')
