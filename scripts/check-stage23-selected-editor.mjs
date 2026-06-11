import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const editor = read('src/configurator/steps/SelectedCompartmentEditor.tsx')
for (const token of ['export function SelectedCompartmentEditor','useConfigBridge','MiniCounter','CompartmentKind']) {
  if (!editor.includes(token)) fail(`SelectedCompartmentEditor missing ${token}`)
  else pass(`SelectedCompartmentEditor contains ${token}`)
}

const filling = read('src/configurator/steps/FillingStep.tsx')
if (!filling.includes('import { SelectedCompartmentEditor }')) fail('FillingStep missing SelectedCompartmentEditor import')
else pass('FillingStep imports SelectedCompartmentEditor')
if (filling.includes('function SelectedCompartmentEditor')) fail('FillingStep still defines SelectedCompartmentEditor')
else pass('FillingStep no longer defines SelectedCompartmentEditor')

if (!ok) process.exit(1)
console.log('Stage 23 SelectedCompartmentEditor extraction checks passed.')
