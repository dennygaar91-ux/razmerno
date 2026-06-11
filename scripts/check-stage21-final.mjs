import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

const checks = [
  ['src/configurator/store/configActions.ts',['reset','setOrderId']],
  ['src/configurator/checkout/buildCheckoutOrderPayload.ts',['buildCheckoutOrderPayload','facadeKind']],
  ['src/configurator/CheckoutDrawer.tsx',['useConfigBridge','buildCheckoutOrderPayload','actions.setOrderId']],
  ['tests/config-actions-reset.test.ts',['Config actions reset test passed']],
  ['tests/checkout-payload.test.ts',['Checkout payload test passed']],
  ['docs/BACKLOG.md',['Stage 21 / Core architecture remaining']],
  ['docs/history/STAGE_21_FINAL_REPORT.md',['Core Architecture Stabilization Continued','Scope verification']]
]

for (const [rel,tokens] of checks) {
  if (!fs.existsSync(path.join(root, rel))) { fail(`${rel} missing`); continue }
  const source=read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

for (const rel of [
  'src/configurator/ConfiguratorPage.tsx',
  'src/configurator/Visualization.tsx',
  'src/configurator/steps/ActiveStep.tsx',
  'src/configurator/ProductionDebugPanel.tsx',
  'src/configurator/three/ThreeLayoutMarkers.tsx',
  'src/configurator/CheckoutDrawer.tsx',
]) {
  const source=read(rel)
  if (!source.includes('useConfigBridge')) fail(`${rel} must use useConfigBridge`)
  else pass(`${rel} uses useConfigBridge`)
  if (source.includes('useConfig(')) fail(`${rel} still calls useConfig`)
  else pass(`${rel} does not call useConfig`)
}

if (!ok) process.exit(1)
console.log('Stage 21 final checks passed.')
