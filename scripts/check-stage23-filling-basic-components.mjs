import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const [rel,tokens] of [
  ['src/configurator/steps/AdvancedLayoutToggle.tsx',['export function AdvancedLayoutToggle','useConfigBridge']],
  ['src/configurator/steps/CompartmentCountControl.tsx',['export function CompartmentCountControl','createEqualCompartments','useConfigBridge']],
  ['src/configurator/steps/FillingStep.tsx',['import { AdvancedLayoutToggle }','import { CompartmentCountControl }']]
]) {
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

const filling = read('src/configurator/steps/FillingStep.tsx')
if (filling.includes('function AdvancedLayoutToggle') || filling.includes('function CompartmentCountControl')) {
  fail('FillingStep still defines extracted basic components')
} else {
  pass('FillingStep no longer defines extracted basic components')
}

if (!ok) process.exit(1)
console.log('Stage 23 basic FillingStep extraction checks passed.')
