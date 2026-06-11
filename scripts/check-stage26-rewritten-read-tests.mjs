import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

for (const rel of [
  'src/configurator/store/configHeaderZustandRead.test.ts',
  'src/configurator/store/mobileBarZustandRead.test.ts',
  'src/configurator/store/stepperZustandRead.test.ts',
  'src/configurator/store/threeMarkersZustandRead.test.ts',
  'src/configurator/store/threeViewerZustandRead.test.ts',
]) {
  const source = read(rel)
  if (source.includes('useConfig()')) fail(`${rel} still references useConfig()`)
  else pass(`${rel} no longer references useConfig()`)
}

const guard = read('scripts/check-stage24-legacy-config-usage.mjs')
for (const rel of [
  'configHeaderZustandRead.test.ts',
  'mobileBarZustandRead.test.ts',
  'stepperZustandRead.test.ts',
  'threeMarkersZustandRead.test.ts',
  'threeViewerZustandRead.test.ts',
]) {
  if (guard.includes(rel)) fail(`legacy guard still allows ${rel}`)
  else pass(`legacy guard no longer allows ${rel}`)
}

if (!ok) process.exit(1)
console.log('Stage 26 rewritten read tests checks passed.')
