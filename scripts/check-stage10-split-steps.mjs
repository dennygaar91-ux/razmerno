import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
const files = [
  'src/configurator/steps/StepShell.tsx',
  'src/configurator/steps/DimensionsStep.tsx',
  'src/configurator/steps/FillingStep.tsx',
  'src/configurator/steps/MaterialsStep.tsx',
  'src/configurator/steps/ReviewStep.tsx',
  'src/configurator/steps/ActiveStep.tsx',
]
for (const rel of files) {
  if (!fs.existsSync(path.join(root, rel))) fail(`${rel} missing`)
  else pass(`${rel} exists`)
}
const facade = fs.readFileSync(path.join(root, 'src/configurator/steps.tsx'), 'utf8')
for (const token of ['TypeDimensionsStep','FillingStep','MaterialsStep','ReviewStep','ActiveStep']) {
  if (!facade.includes(`export { ${token}`)) fail(`steps facade missing ${token}`)
  else pass(`steps facade exports ${token}`)
}
if (!ok) process.exit(1)
console.log('Stage 10 split steps checks passed.')
