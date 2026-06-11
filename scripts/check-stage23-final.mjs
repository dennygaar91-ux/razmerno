import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

const components = [
  'AdvancedLayoutToggle',
  'CompartmentCountControl',
  'SelectedCompartmentEditor',
  'LayoutPreview',
  'CounterRow',
  'MiniCounter'
]

for (const name of components) {
  const rel = `src/configurator/steps/${name}.tsx`
  if (!fs.existsSync(path.join(root, rel))) {
    fail(`${rel} missing`)
    continue
  }
  const source = read(rel)
  if (!source.includes(`export function ${name}`)) fail(`${rel} missing export function`)
  else pass(`${rel} exports ${name}`)
}

const filling = read('src/configurator/steps/FillingStep.tsx')
for (const name of components.filter((name) => name !== 'MiniCounter')) {
  if (!filling.includes(`import { ${name} }`)) fail(`FillingStep missing ${name} import`)
  else pass(`FillingStep imports ${name}`)
  if (filling.includes(`function ${name}`)) fail(`FillingStep still defines ${name}`)
  else pass(`FillingStep no longer defines ${name}`)
}

const lineCount = filling.split('\n').length
if (lineCount > 260) fail(`FillingStep still too large after split: ${lineCount}`)
else pass(`FillingStep line count improved: ${lineCount}`)

if (!read('docs/history/STAGE_23_FINAL_REPORT.md').includes('Scope verification')) fail('final report missing scope verification')
else pass('final report contains scope verification')

if (!ok) process.exit(1)
console.log('Stage 23 final checks passed.')
