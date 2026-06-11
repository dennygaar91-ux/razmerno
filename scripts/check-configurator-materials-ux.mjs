import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','configurator','steps','MaterialsStep.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['Выберите внешний вид','Оформите видимые части','технические решения система оставит внутри расчета','что видно сбоку','что видно спереди','Корпус','Фасады','Ручки']) {
  if (!source.includes(token)) fail(`Materials UX missing ${token}`)
  else pass(`Materials UX contains ${token}`)
}
if (!ok) process.exit(1)
console.log('Configurator materials UX checks passed.')
