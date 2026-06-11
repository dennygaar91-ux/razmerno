import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','components','Support.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['набор деталей','Смета в письме','цель MVP — заявка','PDF-смета','/configurator']) {
  if (!source.includes(token)) fail(`assembly section missing ${token}`)
  else pass(`assembly section contains ${token}`)
}
if (!ok) process.exit(1)
console.log('Landing assembly checks passed.')
