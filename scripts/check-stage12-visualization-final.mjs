import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['src/configurator/three/visualSystem.ts',['viewerSurfaceClass','assemblySteps','viewerGlassChipClass']],
  ['src/configurator/three/AssemblyTimeline.tsx',['Cinematic assembly','Режим деталей']],
  ['src/configurator/three/ThreeViewer.tsx',['AssemblyTimeline','Поверните модель пальцем','ambientLight intensity={0.62}']],
  ['src/configurator/three/ViewerToolbar.tsx',['Режим просмотра','3D вид','Разбор','мм']],
  ['src/configurator/three/ProductionModel2DView.tsx',['viewerSurfaceClass']],
  ['src/configurator/Visualization.tsx',['radial-gradient(circle_at_50%_18%']]
]

for (const [rel,tokens] of checks) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) { fail(`${rel} missing`); continue }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 12 visualization final checks passed.')
