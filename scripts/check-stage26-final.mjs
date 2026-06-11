import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

const checks = [
  ['docs/CONTEXT_REMOVAL_PLAN.md',['Pure state engine','Zustand owns reducer','Remove context']],
  ['scripts/check-stage26-context-removal-readiness.mjs',['Unexpected direct useConfig consumers']],
  ['docs/BACKLOG.md',['Stage 26 / Compatibility cleanup remaining']],
  ['docs/history/STAGE_26_FINAL_REPORT.md',['Compatibility Tests Cleanup','Scope verification']]
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
  'src/configurator/store/configHeaderZustandRead.test.ts',
  'src/configurator/store/mobileBarZustandRead.test.ts',
  'src/configurator/store/stepperZustandRead.test.ts',
  'src/configurator/store/threeMarkersZustandRead.test.ts',
  'src/configurator/store/threeViewerZustandRead.test.ts',
]) {
  const source = read(rel)
  if (source.includes('useConfig(')) fail(`${rel} still contains direct useConfig token`)
  else pass(`${rel} has no direct useConfig token`)
}

if (!ok) process.exit(1)
console.log('Stage 26 final checks passed.')
