import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const configDir = path.join(root, 'src', 'config')

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(configDir, file), 'utf8'))
}

let ok = true
function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}
function pass(message) {
  console.log(`✓ ${message}`)
}

const materials = readJson('materials.json')
const facadeStyles = readJson('facade-styles.json')
const hardware = readJson('hardware.json')
const furniturePresets = readJson('furniture-presets.json')
const fillingPresets = readJson('filling-presets.json')
const limits = readJson('limits.json')
const pricing = readJson('pricing.json')
const manifest = readJson('manifest.json')

function assertUnique(items, label) {
  const ids = new Set()
  for (const item of items) {
    if (!item.id) fail(`${label}: item without id`)
    if (ids.has(item.id)) fail(`${label}: duplicate id ${item.id}`)
    ids.add(item.id)
  }
  pass(`${label}: ids are unique`)
}

assertUnique(materials, 'materials')
assertUnique(facadeStyles, 'facade styles')
assertUnique(hardware, 'hardware')
assertUnique(furniturePresets, 'furniture presets')
assertUnique(fillingPresets, 'filling presets')

for (const material of materials) {
  if (!material.name || !material.vendor) fail(`material ${material.id}: missing name/vendor`)
  if (typeof material.pricePerLiter !== 'number' || material.pricePerLiter <= 0) fail(`material ${material.id}: invalid pricePerLiter`)
  if (!Array.isArray(material.faces) || material.faces.length !== 3) fail(`material ${material.id}: faces must contain 3 colors`)
}

for (const style of facadeStyles) {
  if (typeof style.priceMultiplier !== 'number' || style.priceMultiplier <= 0) fail(`facade style ${style.id}: invalid multiplier`)
}

for (const item of hardware) {
  if (!['base', 'comfort'].includes(item.level)) fail(`hardware ${item.id}: invalid level`)
  if (typeof item.basePrice !== 'number' || item.basePrice < 0) fail(`hardware ${item.id}: invalid basePrice`)
  if (typeof item.priceFactor !== 'number' || item.priceFactor < 0) fail(`hardware ${item.id}: invalid priceFactor`)
}

for (const type of ['wardrobe', 'dresser', 'nightstand']) {
  const item = limits[type]
  if (!item) fail(`limits: missing ${type}`)
  for (const dim of ['width', 'height', 'depth']) {
    if (!item?.[dim] || item[dim].min >= item[dim].max) fail(`limits ${type}.${dim}: min must be less than max`)
  }
}

if (!pricing.deliveryMoscow || !pricing.productionMarkup) fail('pricing: missing deliveryMoscow/productionMarkup')
if (!pricing.filling?.shelf || !pricing.filling?.drawer || !pricing.filling?.rod) fail('pricing: missing filling prices')

for (const [file, meta] of Object.entries(manifest.files ?? {})) {
  const raw = fs.readFileSync(path.join(configDir, file))
  const hash = crypto.createHash('sha256').update(raw).digest('hex')
  if (hash !== meta.sha256) fail(`manifest: ${file} hash mismatch`)
}
pass('manifest: hashes are valid')

if (!manifest.configVersion || !manifest.schemaVersion) {
  fail('manifest: missing configVersion/schemaVersion')
}

if (!ok) process.exit(1)
console.log('Config validation passed.')
