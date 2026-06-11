import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const rel of ['src/components/Support.tsx', 'src/configurator/PriceCard.tsx']) {
  const source = fs.readFileSync(path.join(root, rel), 'utf8')
  if (source.includes('Собрать набор')) fail(`${rel} still contains Собрать набор`)
  else pass(`${rel} does not contain legacy CTA`)
}
if (!fs.readFileSync(path.join(root,'src/configurator/PriceCard.tsx'),'utf8').includes('Открыть заявку')) fail('PriceCard must contain Открыть заявку')
else pass('PriceCard contains Открыть заявку')
if (!fs.readFileSync(path.join(root,'src/components/Support.tsx'),'utf8').includes('Открыть конструктор')) fail('Support must contain Открыть конструктор')
else pass('Support contains Открыть конструктор')
if (!ok) process.exit(1)
console.log('Stage 8 CTA copy checks passed.')
