import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

for (const rel of [
  'src/configurator/steps/DimensionsStep.tsx',
  'src/configurator/steps/MaterialsStep.tsx',
  'src/configurator/steps/ReviewStep.tsx',
  'src/configurator/steps/FillingStep.tsx',
]) {
  const source = read(rel)
  if (!source.includes('useConfigBridge')) fail(`${rel} does not use useConfigBridge`)
  else pass(`${rel} uses useConfigBridge`)
  if (source.includes('useConfig(')) fail(`${rel} still calls useConfig`)
  else pass(`${rel} no longer calls useConfig`)
}

const filling = read('src/configurator/steps/FillingStep.tsx')
if (filling.includes('dispatch({ type:')) fail('FillingStep still contains raw dispatch')
else pass('FillingStep has no raw dispatch action strings')
if (!read('src/configurator/steps/MiniCounter.tsx').includes('export function MiniCounter')) fail('MiniCounter missing')
else pass('MiniCounter exists')

for (const rel of [
  'docs/BACKLOG.md',
  'docs/history/STAGE_22_FINAL_REPORT.md'
]) {
  if (!fs.existsSync(path.join(root, rel))) fail(`${rel} missing`)
  else pass(`${rel} exists`)
}

if (!ok) process.exit(1)
console.log('Stage 22 final checks passed.')
