import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','configurator','steps','ReviewStep.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['Проверьте заявку','Стоимость шкафа без доставки и сборки','МКАД 6 000 ₽','+50 ₽/км','+10%','Открыть заявку','Получите номер заказа']) {
  if (!source.includes(token)) fail(`Review UX missing ${token}`)
  else pass(`Review UX contains ${token}`)
}
if (source.includes('btn-secondary')) fail('Review step must not use unknown btn-secondary')
else pass('unknown btn-secondary removed')
if (!ok) process.exit(1)
console.log('Configurator review UX checks passed.')
