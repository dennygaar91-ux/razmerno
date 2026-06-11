import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const migrated = [
  'src/configurator/ConfiguratorPage.tsx',
  'src/configurator/Visualization.tsx',
  'src/configurator/steps/ActiveStep.tsx',
  'src/configurator/ConfigHeader.tsx',
  'src/configurator/ProductionDebugPanel.tsx',
  'src/configurator/three/ThreeLayoutMarkers.tsx',
]

for (const rel of migrated) {
  const source = read(rel)
  if (!source.includes('useConfigBridge')) fail(`${rel} does not use useConfigBridge`)
  else pass(`${rel} uses useConfigBridge`)
  if (source.includes('useConfig(')) fail(`${rel} still calls useConfig`)
  else pass(`${rel} no longer calls useConfig`)
}

const actions = read('src/configurator/store/configActions.ts')
if (!actions.includes('reset: () => dispatch({ type: "RESET" })')) fail('typed reset action missing')
else pass('typed reset action exists')

const resetTest = read('tests/config-actions-reset.test.ts')
if (!resetTest.includes('Config actions reset test passed')) fail('reset test missing')
else pass('reset test exists')

if (!ok) process.exit(1)
console.log('Stage 21 bridge continuation checks passed.')
