import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const counter = read('src/configurator/steps/CounterRow.tsx')
for (const token of ['export function CounterRow','onHighlight','onHighlightEnd']) {
  if (!counter.includes(token)) fail(`CounterRow missing ${token}`)
  else pass(`CounterRow contains ${token}`)
}

const filling = read('src/configurator/steps/FillingStep.tsx')
if (!filling.includes('import { CounterRow }')) fail('FillingStep missing CounterRow import')
else pass('FillingStep imports CounterRow')
if (filling.includes('function CounterRow')) fail('FillingStep still defines CounterRow')
else pass('FillingStep no longer defines CounterRow')

for (const name of ['AdvancedLayoutToggle','CompartmentCountControl','SelectedCompartmentEditor','LayoutPreview','CounterRow','MiniCounter']) {
  if (!fs.existsSync(path.join(root, `src/configurator/steps/${name}.tsx`))) fail(`${name}.tsx missing`)
  else pass(`${name}.tsx exists`)
}

if (!ok) process.exit(1)
console.log('Stage 23 CounterRow extraction checks passed.')
