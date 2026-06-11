import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','configurator','steps','DimensionsStep.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['Укажите размеры места','монтажный запас 20–30 мм','Быстрые размеры','rzm-touch-target','DIMENSION_HELP','Каркас']) {
  if (!source.includes(token)) fail(`Dimensions UX missing ${token}`)
  else pass(`Dimensions UX contains ${token}`)
}
if (!ok) process.exit(1)
console.log('Configurator dimensions UX checks passed.')
