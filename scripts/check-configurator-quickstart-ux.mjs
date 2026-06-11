import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','configurator','QuickStart.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['Шаг 0 · быстрый старт','Новичку — wizard','расширенные параметры','quickstart_redesign','rzm-card-dark','Выбрать']) {
  if (!source.includes(token)) fail(`QuickStart missing ${token}`)
  else pass(`QuickStart contains ${token}`)
}
if (source.includes('var(--color-')) fail('QuickStart should not use old color tokens')
else pass('QuickStart old color tokens removed')
if (!ok) process.exit(1)
console.log('Configurator QuickStart UX checks passed.')
