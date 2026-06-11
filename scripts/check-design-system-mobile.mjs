import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const css = fs.readFileSync(path.join(root,'src','index.css'),'utf8')
const mobile = fs.readFileSync(path.join(root,'src','configurator','MobileBottomBar.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['.rzm-touch-target','.rzm-mobile-sheet','.rzm-mobile-panel']) {
  if (!css.includes(token)) fail(`missing ${token}`)
  else pass(`exists ${token}`)
}
if (!mobile.includes('rzm-touch-target')) fail('MobileBottomBar button must use rzm-touch-target')
else pass('MobileBottomBar button uses rzm-touch-target')
if (!mobile.includes('rzm-mobile-sheet')) fail('MobileBottomBar surface must use rzm-mobile-sheet')
else pass('MobileBottomBar surface uses rzm-mobile-sheet')
if (!ok) process.exit(1)
console.log('Design system mobile checks passed.')
