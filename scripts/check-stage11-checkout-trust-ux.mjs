import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root, 'src/configurator/CheckoutDrawer.tsx'), 'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['Что будет после заявки','Получите номер заявки','Менеджер сверит размеры','Итог с выбранными услугами']) {
  if (!source.includes(token)) fail(`CheckoutDrawer missing ${token}`)
  else pass(`CheckoutDrawer contains ${token}`)
}
if (!ok) process.exit(1)
console.log('Stage 11 checkout trust UX checks passed.')
