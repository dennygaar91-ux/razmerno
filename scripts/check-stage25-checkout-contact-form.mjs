import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

const form = read('src/configurator/checkout/CheckoutContactForm.tsx')
for (const token of ['export function CheckoutContactForm','CheckoutField','company','clearError']) {
  if (!form.includes(token)) fail(`CheckoutContactForm missing ${token}`)
  else pass(`CheckoutContactForm contains ${token}`)
}
const drawer = read('src/configurator/CheckoutDrawer.tsx')
if (!drawer.includes('CheckoutContactForm')) fail('CheckoutDrawer missing CheckoutContactForm')
else pass('CheckoutDrawer imports/uses CheckoutContactForm')
if (drawer.includes('placeholder="+7 999 123-45-67"')) fail('CheckoutDrawer still owns phone field')
else pass('CheckoutDrawer no longer owns contact fields')
if (!ok) process.exit(1)
console.log('Stage 25 checkout contact form checks passed.')
