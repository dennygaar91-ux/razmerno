import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','components','FearsReworked.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['Система ведёт за руку','Новичку','Опытному','backend','rzm-card-dark']) {
  if (!source.includes(token)) fail(`system section missing ${token}`)
  else pass(`system section contains ${token}`)
}
if (source.includes('страх')) fail('system section should not use fear-based positioning')
else pass('fear-based copy removed')
if (!ok) process.exit(1)
console.log('Landing system section checks passed.')
