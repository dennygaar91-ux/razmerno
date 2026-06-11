import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','components','Faq.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['6 000 ₽','50 ₽','10%','fallback','кухни не трогаем','сметы в ответном письме']) {
  if (!source.includes(token)) fail(`FAQ missing ${token}`)
  else pass(`FAQ contains ${token}`)
}
if (!ok) process.exit(1)
console.log('Landing FAQ checks passed.')
