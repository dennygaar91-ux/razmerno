import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok = false }
function pass(m){ console.log(`✓ ${m}`) }

const required = [
  ['src/configurator/state/initialConfigState.ts', ['initialConfigState']],
  ['src/configurator/state/configNormalization.ts', ['normalizeConfigState']],
  ['src/configurator/state/configReducer.ts', ['configReducer', 'legacyConfigReducer']],
  ['tests/pure-config-state-engine.test.ts', ['Pure config state engine test passed']],
]

for (const [rel, tokens] of required) {
  const abs = path.join(root, rel)
  if (!fs.existsSync(abs)) {
    fail(`${rel} missing`)
    continue
  }
  const source = fs.readFileSync(abs, 'utf8')
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

if (!ok) process.exit(1)
console.log('Stage 27 pure state engine checks passed.')
