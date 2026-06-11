import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

const block=read('src/configurator/checkout/CheckoutSubmitBlock.tsx')
for (const token of ['export function CheckoutSubmitBlock','Отправить и получить смету','Политика конфиденциальности']) {
  if (!block.includes(token)) fail(`CheckoutSubmitBlock missing ${token}`)
  else pass(`CheckoutSubmitBlock contains ${token}`)
}
const drawer=read('src/configurator/CheckoutDrawer.tsx')
if (!drawer.includes('CheckoutSubmitBlock')) fail('CheckoutDrawer missing CheckoutSubmitBlock')
else pass('CheckoutDrawer uses CheckoutSubmitBlock')
if (drawer.includes('Отправляем заявку') || drawer.includes('Политика конфиденциальности')) fail('CheckoutDrawer still owns submit block copy')
else pass('CheckoutDrawer no longer owns submit block copy')
if (!ok) process.exit(1)
console.log('Stage 25 checkout submit block checks passed.')
