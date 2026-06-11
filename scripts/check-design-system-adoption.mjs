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

const expectations = [
  ['src/App.tsx', 'rzm-card-soft'],
  ['src/configurator/ConfigHeader.tsx', 'rzm-card'],
  ['src/configurator/MobileBottomBar.tsx', 'rzm-bottom-surface'],
]

for (const [rel, token] of expectations) {
  const source = fs.readFileSync(path.join(root, rel), 'utf8')
  if (!source.includes(token)) fail(`${rel} must use ${token}`)
  else pass(`${rel} uses ${token}`)
}

if (!ok) process.exit(1)
console.log('Design system adoption checks passed.')
