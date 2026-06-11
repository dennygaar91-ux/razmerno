import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

const checks = [
  ['src/configurator/state/initialConfigState.ts',['initialConfigState']],
  ['src/configurator/state/configNormalization.ts',['normalizeConfigState']],
  ['src/configurator/state/configReducer.ts',['configReducer','legacyConfigReducer']],
  ['src/configurator/store/configStore.ts',['../state/initialConfigState','../state/configReducer']],
  ['tests/pure-config-state-engine.test.ts',['Pure config state engine test passed']],
  ['docs/BACKLOG.md',['Stage 27 / Pure state engine remaining']],
  ['docs/history/STAGE_27_FINAL_REPORT.md',['Pure Config State Engine Foundation','Scope verification']]
]

for (const [rel,tokens] of checks) {
  if (!fs.existsSync(path.join(root, rel))) { fail(`${rel} missing`); continue }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

const store = read('src/configurator/store/configStore.ts')
if (store.includes('from "../context"')) fail('configStore imports from context')
else pass('configStore does not import from context')

if (!ok) process.exit(1)
console.log('Stage 27 final checks passed.')
