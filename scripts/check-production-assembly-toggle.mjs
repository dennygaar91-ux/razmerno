import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checkout = read('src/configurator/CheckoutDrawer.tsx')
for (const token of ['assemblyEnabled','calculateAssemblyQuote','Заказать сборку','+10% от стоимости шкафа','assembly: { enabled: assemblyEnabled']) {
  if (!checkout.includes(token)) fail(`Checkout missing ${token}`)
  else pass(`Checkout contains ${token}`)
}

const assembly = read('src/pricing/assembly.ts')
for (const token of ['ASSEMBLY_RATE = 0.1','calculateAssemblyQuote','validateAssembly']) {
  if (!assembly.includes(token)) fail(`assembly pricing missing ${token}`)
  else pass(`assembly pricing contains ${token}`)
}

const order = read('src/shared/lib/order.ts')
if (!order.includes('assembly?: { enabled: boolean; price: number; rate: number; basePrice: number }')) fail('client order payload missing assembly')
else pass('client order payload has assembly')

const types = read('api/_shared/order-types.ts')
for (const token of ['assembly?: { enabled?: boolean','assembly_enabled','assembly_price','assembly_rate','assembly_base_price']) {
  if (!types.includes(token)) fail(`server order types missing ${token}`)
  else pass(`server order types contain ${token}`)
}

const serverPrice = read('api/_shared/server-price.ts')
for (const token of ['calculateAssemblyQuote','assembly: assemblyQuote.price','total: basePrice.total + deliveryQuote.price + assemblyQuote.price']) {
  if (!serverPrice.includes(token)) fail(`server price missing ${token}`)
  else pass(`server price contains ${token}`)
}

if (!ok) process.exit(1)
console.log('Production assembly toggle checks passed.')
