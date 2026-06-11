import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { calculateDeliveryQuote, validateDelivery } from '../src/pricing/delivery.ts'

const root = process.cwd()
const source = fs.readFileSync(path.join(root, 'src', 'pricing', 'delivery.ts'), 'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

try {
  assert.equal(calculateDeliveryQuote(true, 'Москва, Тверская 1').price, 6000)
  pass('MKAD delivery costs 6000')
  assert.equal(calculateDeliveryQuote(true, 'Московская область, за МКАД 20 км').price, 7000)
  pass('outside MKAD delivery adds 50 rub/km')
  assert.equal(validateDelivery(true, 'МО, за МКАД'), 'Для доставки за МКАД укажите расстояние от МКАД в километрах')
  pass('outside MKAD distance validation works')
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}

for (const token of ['DELIVERY_MKAD_PRICE = 6000', 'DELIVERY_OUTSIDE_MKAD_PRICE_PER_KM = 50', 'extractOutsideMkadDistanceKm']) {
  if (!source.includes(token)) fail(`delivery source missing ${token}`)
  else pass(`delivery source contains ${token}`)
}

if (!ok) process.exit(1)
console.log('Production delivery rules checks passed.')
