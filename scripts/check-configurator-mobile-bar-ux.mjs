import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','configurator','MobileBottomBar.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['Стоимость шкафа','Открыть заявку','Исправить','rzm-mobile-sheet','rzm-touch-target']) {
  if (!source.includes(token)) fail(`Mobile bar UX missing ${token}`)
  else pass(`Mobile bar UX contains ${token}`)
}
if (source.includes('Собрать набор')) fail('Mobile bar must not use old CTA copy')
else pass('old mobile CTA removed')
if (!ok) process.exit(1)
console.log('Configurator mobile bar UX checks passed.')
