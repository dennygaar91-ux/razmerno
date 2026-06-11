import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','configurator','steps','FillingStep.tsx'),'utf8')
const layoutPreview = fs.readFileSync(path.join(root,'src','configurator','steps','LayoutPreview.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['Разложите наполнение','Соберите шкаф крупными частями','Секции по ширине','уточните','Секции']) {
  if (!source.includes(token)) fail(`Filling UX missing ${token}`)
  else pass(`Filling UX contains ${token}`)
}
for (const token of ['Собираем по секциям','rzm-section-stack','rzm-compartment-tile']) {
  if (!layoutPreview.includes(token)) fail(`Layout preview missing ${token}`)
  else pass(`Layout preview contains ${token}`)
}
if (source.includes('var(--color-accent')) fail('Filling step should not use old accent semantic tokens')
else pass('old accent semantic tokens removed from filling step')
if (!ok) process.exit(1)
console.log('Configurator filling UX checks passed.')
