import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const css = fs.readFileSync(path.join(root,'src','index.css'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['.rzm-animate-in','.rzm-hover-lift','.rzm-pressable','.rzm-step-motion','rzmModuleSnap']) {
  if (!css.includes(token)) fail(`missing motion primitive ${token}`)
  else pass(`motion primitive exists ${token}`)
}
if (css.includes('@keyframes modSnap')) fail('legacy modSnap keyframes must not exist')
else pass('legacy modSnap removed')
if (!ok) process.exit(1)
console.log('Design system motion checks passed.')
