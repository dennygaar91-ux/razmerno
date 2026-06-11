import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const preview = read('src/configurator/steps/LayoutPreview.tsx')
for (const token of ['export function LayoutPreview','useConfigBridge','actions.addSectionByWidth','actions.addCompartmentByHeight','actions.setSelectedCompartment']) {
  if (!preview.includes(token)) fail(`LayoutPreview missing ${token}`)
  else pass(`LayoutPreview contains ${token}`)
}

const filling = read('src/configurator/steps/FillingStep.tsx')
if (!filling.includes('import { LayoutPreview }')) fail('FillingStep missing LayoutPreview import')
else pass('FillingStep imports LayoutPreview')
if (filling.includes('function LayoutPreview')) fail('FillingStep still defines LayoutPreview')
else pass('FillingStep no longer defines LayoutPreview')

if (!ok) process.exit(1)
console.log('Stage 23 LayoutPreview extraction checks passed.')
