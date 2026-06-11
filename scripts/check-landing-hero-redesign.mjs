import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const hero = fs.readFileSync(path.join(root,'src','components','HeroReworked.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

for (const token of ['как Lego','Live preview','HeroCabinetVisual','rzm-card-dark','Собрать свой шкаф','/configurator?']) {
  if (!hero.includes(token)) fail(`Hero missing ${token}`)
  else pass(`Hero contains ${token}`)
}
if (!hero.includes('/configurator?')) fail('Hero must use normal configurator routing')
else pass('Hero uses normal routing')
if (!ok) process.exit(1)
console.log('Landing hero redesign checks passed.')
