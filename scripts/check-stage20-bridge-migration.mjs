import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const migrated = [
  'src/configurator/HorizontalStepper.tsx',
  'src/configurator/PriceCard.tsx',
  'src/configurator/MobileBottomBar.tsx',
  'src/configurator/QuickStart.tsx',
  'src/configurator/ConfigHeader.tsx',
]

for (const rel of migrated) {
  const source = read(rel)
  if (!source.includes('useConfigBridge')) fail(`${rel} does not use useConfigBridge`)
  else pass(`${rel} uses useConfigBridge`)
  if (source.includes('useConfig(')) fail(`${rel} still calls useConfig`)
  else pass(`${rel} no longer calls useConfig`)
}

if (!ok) process.exit(1)
console.log('Stage 20 bridge migration checks passed.')
