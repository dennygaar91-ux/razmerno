import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root, 'src/configurator/steps/FillingStep.tsx'), 'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

if (!source.includes('useConfigBridge')) fail('FillingStep does not use useConfigBridge')
else pass('FillingStep uses useConfigBridge')
if (source.includes('useConfig(')) fail('FillingStep still calls useConfig')
else pass('FillingStep no longer calls useConfig')

for (const token of [
  'actions.applyFillingPreset',
  'actions.setSections',
  'actions.setFilling',
  'actions.setAdvancedLayout',
  'actions.setCompartmentKind',
  'actions.setCompartmentShelves',
  'actions.setCompartmentDrawers',
  'actions.addSectionByWidth',
  'actions.addCompartmentByHeight',
  'actions.setSelectedCompartment'
]) {
  if (!source.includes(token)) fail(`FillingStep missing ${token}`)
  else pass(`FillingStep contains ${token}`)
}

if (source.includes('dispatch({ type:')) fail('FillingStep still contains raw dispatch action')
else pass('FillingStep no longer contains raw dispatch action')

if (!ok) process.exit(1)
console.log('Stage 22 FillingStep bridge checks passed.')
