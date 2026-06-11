import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(message) { console.error(`✗ ${message}`); ok = false }
function pass(message) { console.log(`✓ ${message}`) }

const sourceDirs = ['api', 'src']
const allowedUseConfigFiles = new Set([
  'src/configurator/context.tsx',
  'src/configurator/Visualization.tsx',
  'src/configurator/steps.tsx',
  'src/configurator/HorizontalStepper.tsx',
  'src/configurator/CheckoutDrawer.tsx',
  'src/configurator/ConfigHeader.tsx',
  'src/configurator/ProductionDebugPanel.tsx',
  'src/configurator/PriceCard.tsx',
  'src/configurator/MobileBottomBar.tsx',
  'src/configurator/QuickStart.tsx',
  'src/configurator/ThreeViewer.tsx',
  'src/configurator/three/markers.ts',
  'src/configurator/ConfiguratorPage.tsx',
  'src/configurator/three/ThreeLayoutMarkers.tsx',
  'src/configurator/store/configHeaderZustandRead.test.ts',
  'src/configurator/store/mobileBarZustandRead.test.ts',
  'src/configurator/store/stepperZustandRead.test.ts',
  'src/configurator/store/threeMarkersZustandRead.test.ts',
  'src/configurator/store/threeViewerZustandRead.test.ts',
])

const forbidden = [
  {
    name: 'frontend admin static key',
    pattern: 'VITE_ADMIN_ACCESS_KEY',
    allow: [],
  },
  {
    name: 'legacy CTA',
    pattern: 'Собрать набор',
    allow: [],
  },
  {
    name: 'plaintext admin password env',
    pattern: 'ADMIN_LOGIN_PASSWORD',
    allow: [],
  },
]

function walk(dir) {
  const result = []
  if (!fs.existsSync(dir)) return result
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) result.push(...walk(file))
    else if (/\.(ts|tsx|js|jsx|mjs|json|md|css)$/.test(entry.name)) result.push(file)
  }
  return result
}

const files = sourceDirs.flatMap((dir) => walk(path.join(root, dir)))

for (const file of files) {
  const rel = path.relative(root, file).replaceAll(path.sep, '/')
  const source = fs.readFileSync(file, 'utf8')

  for (const rule of forbidden) {
    if (source.includes(rule.pattern) && !rule.allow.includes(rel)) {
      fail(`${rule.name}: ${rel} contains ${rule.pattern}`)
    }
  }

  if (source.includes('useConfig(') && !allowedUseConfigFiles.has(rel)) {
    fail(`new forbidden useConfig usage: ${rel}`)
  }
}

if (ok) {
  pass('no forbidden frontend static admin key')
  pass('no legacy CTA in active source')
  pass('no plaintext admin password env in active source')
  pass('no new useConfig usage outside approved migration list')
}

if (!ok) process.exit(1)
console.log('Architecture consistency checks passed.')
