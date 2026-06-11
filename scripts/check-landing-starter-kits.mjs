import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','components','ProjectsReworked.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['Стартовые наборы','Открыть в конструкторе','/configurator?','MiniCabinet','не отзывы']) {
  if (!source.includes(token)) fail(`starter kits missing ${token}`)
  else pass(`starter kits contains ${token}`)
}
if (!ok) process.exit(1)
console.log('Landing starter kits checks passed.')
