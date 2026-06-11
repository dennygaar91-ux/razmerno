import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const rel of [
  'src/configurator/steps/DimensionsStep.tsx',
  'src/configurator/steps/MaterialsStep.tsx',
  'src/configurator/steps/ReviewStep.tsx',
]) {
  const source = read(rel)
  if (!source.includes('useConfigBridge')) fail(`${rel} does not use useConfigBridge`)
  else pass(`${rel} uses useConfigBridge`)
  if (source.includes('useConfig(')) fail(`${rel} still calls useConfig`)
  else pass(`${rel} no longer calls useConfig`)
}

const review = read('src/configurator/steps/ReviewStep.tsx')
if (!review.includes('actions.openCheckout')) fail('ReviewStep missing typed checkout action')
else pass('ReviewStep uses typed checkout action')

if (!ok) process.exit(1)
console.log('Stage 22 simple step bridge checks passed.')
