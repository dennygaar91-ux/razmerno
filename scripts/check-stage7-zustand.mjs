import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

function mustInclude(rel, token, label) {
  const source = read(rel)
  if (!source.includes(token)) fail(`${rel}: ${label}`)
  else pass(`${rel}: ${label}`)
}

function mustNotInclude(rel, token, label) {
  const source = read(rel)
  if (source.includes(token)) fail(`${rel}: ${label}`)
  else pass(`${rel}: ${label}`)
}

mustInclude('src/configurator/store/configStore.ts', 'create<ConfigStoreState>', 'Zustand store exists')
mustInclude('src/configurator/store/useConfigSelectors.ts', 'useConfigStateSelector', 'selector bridge exists')
mustInclude('src/configurator/context.tsx', 'configReducer', 'ConfigProvider exports reducer flow')
mustInclude('src/configurator/context.tsx', 'import("./store/configStore")', 'ConfigProvider syncs store lazily')

for (const [rel, hook] of [
  ['src/configurator/MobileBottomBar.tsx', 'useConfigStateSelector'],
  ['src/configurator/ConfigHeader.tsx', 'useConfigStateSelector'],
  ['src/configurator/HorizontalStepper.tsx', 'useConfigStateSelector'],
  ['src/configurator/three/ThreeLayoutMarkers.tsx', 'useConfigStateSelector'],
  ['src/configurator/three/SelectedCompartmentHighlight.tsx', 'useConfigStateSelector'],
  ['src/configurator/three/ThreeViewer.tsx', 'useConfigStateSelector'],
]) {
  mustInclude(rel, hook, 'reads state via Zustand selector')
}

mustNotInclude('src/configurator/three/ThreeViewer.tsx', 'useConfig()', 'ThreeViewer no longer uses Context hook')
mustNotInclude('src/configurator/three/SelectedCompartmentHighlight.tsx', 'useConfig()', 'SelectedCompartmentHighlight no longer uses Context hook')

const pkg = JSON.parse(read('package.json'))
for (const script of [
  'test:zustand-foundation',
  'test:zustand-bridge',
  'test:provider-store-sync',
  'test:mobile-bar-zustand-read',
  'test:config-header-zustand-read',
  'test:stepper-zustand-read',
  'test:three-markers-zustand-read',
  'test:highlight-zustand-read',
  'test:three-viewer-zustand-read',
]) {
  if (!pkg.scripts?.[script]) fail(`package script missing: ${script}`)
  else pass(`package script exists: ${script}`)
}

if (!ok) process.exit(1)
console.log('Stage 7 Zustand checks passed.')
