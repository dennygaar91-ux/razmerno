import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','components','ProcessReworked.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['Задаёте размер','Собираете модули','Видите цену','Отправляете заявку','расширенные настройки','/configurator']) {
  if (!source.includes(token)) fail(`process missing ${token}`)
  else pass(`process contains ${token}`)
}
if (source.includes('push-to-open')) fail('process should not expose hardware complexity')
else pass('process hides hardware complexity')
if (!ok) process.exit(1)
console.log('Landing process checks passed.')
