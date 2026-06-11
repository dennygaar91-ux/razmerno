import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }
const toolbar = read('src/configurator/three/ViewerToolbar.tsx')
for (const token of ['Режим просмотра','3D вид','Разбор','мм']) {
  if (!toolbar.includes(token)) fail(`ViewerToolbar missing ${token}`)
  else pass(`ViewerToolbar contains ${token}`)
}
const viewer = read('src/configurator/three/ThreeViewer.tsx')
for (const token of ['Поверните модель пальцем','увидеть детали как набор']) {
  if (!viewer.includes(token)) fail(`ThreeViewer missing ${token}`)
  else pass(`ThreeViewer contains ${token}`)
}
if (!ok) process.exit(1)
console.log('Stage 12 viewer controls UX checks passed.')
