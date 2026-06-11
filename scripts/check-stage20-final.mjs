import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

const checks = [
  ['src/configurator/store/useConfigBridge.ts',['useConfigBridge','createConfigActions']],
  ['src/configurator/store/configActions.ts',['setCompartmentKind','setFacadeMaterialKind','setHighlight']],
  ['tests/config-actions-coverage.test.ts',['Config actions coverage test passed']],
  ['tests/config-layout-sync.test.ts',['Config layout sync test passed']],
  ['docs/ARCHITECTURE_CONFIG_STATE.md',['layout','derived compatibility field','useConfigBridge']],
  ['docs/BACKLOG.md',['Stage 20 / Core architecture remaining']],
  ['docs/history/STAGE_20_FINAL_REPORT.md',['Core Architecture Stabilization','Scope verification']]
]

for (const [rel,tokens] of checks) {
  if (!fs.existsSync(path.join(root, rel))) { fail(`${rel} missing`); continue }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

for (const rel of [
  'src/configurator/HorizontalStepper.tsx',
  'src/configurator/PriceCard.tsx',
  'src/configurator/MobileBottomBar.tsx',
  'src/configurator/QuickStart.tsx',
  'src/configurator/ConfigHeader.tsx',
]) {
  const source = read(rel)
  if (!source.includes('useConfigBridge')) fail(`${rel} must use useConfigBridge`)
  else pass(`${rel} uses useConfigBridge`)
  if (source.includes('useConfig(')) fail(`${rel} still calls useConfig`)
  else pass(`${rel} does not call useConfig`)
}

if (!ok) process.exit(1)
console.log('Stage 20 final checks passed.')
