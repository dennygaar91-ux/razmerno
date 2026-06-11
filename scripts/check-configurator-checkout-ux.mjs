import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const checkoutDir = path.join(root, 'src', 'configurator', 'checkout')
const files = [
  path.join(root, 'src', 'configurator', 'CheckoutDrawer.tsx'),
  ...fs.readdirSync(checkoutDir)
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => path.join(checkoutDir, file)),
]
const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['Финальный шаг','Оставьте контакты для проверки','Внутри МКАД — 6 000 ₽','+50 ₽/км','+10% от стоимости шкафа','Отправить и получить смету','Ваш шкаф собран']) {
  if (!source.includes(token)) fail(`Checkout UX missing ${token}`)
  else pass(`Checkout UX contains ${token}`)
}
for (const token of ['Москва — 4 500 ₽', 'Отправить набор', 'Набор почти готов', 'Что будет после заявки']) {
  if (source.includes(token)) fail(`Checkout old copy must be removed: ${token}`)
  else pass(`Checkout old copy removed: ${token}`)
}
if (!ok) process.exit(1)
console.log('Configurator checkout UX checks passed.')
