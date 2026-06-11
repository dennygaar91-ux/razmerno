import fs from 'node:fs'
import path from 'node:path'

const file = path.resolve('src/constructor/data/priceList.normalized.json')
const data = JSON.parse(fs.readFileSync(file, 'utf8'))
const errors = []

if (data.schema !== 'razmerno.normalized-price-list.v1') errors.push('Invalid schema')
if (data.markupMultiplier !== 1.3) errors.push('Markup multiplier must be 1.3')

for (const item of data.items ?? []) {
  if (!item.id || !item.kind || !item.sourceSheet || !item.unit) errors.push(`Missing required fields: ${item.id ?? 'unknown'}`)
  const expected = Math.round(Number(item.sourcePrice) * data.markupMultiplier)
  if (expected !== item.priceWithMarkup) {
    errors.push(`${item.id}: expected ${expected}, got ${item.priceWithMarkup}`)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`Price list verification passed: ${data.items.length} items, markup x${data.markupMultiplier}`)
