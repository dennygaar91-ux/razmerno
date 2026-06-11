import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const css = fs.readFileSync(path.join(root, 'src', 'index.css'), 'utf8')
let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

const requiredTokens = [
  '--rzm-surface-canvas',
  '--rzm-surface-panel',
  '--rzm-text-main',
  '--rzm-brand-clay',
  '--rzm-brand-amber',
  '--rzm-error',
  '--rzm-warning',
  '--rzm-success',
  '--rzm-radius-xl',
  '--rzm-shadow-panel',
  '--rzm-ease-spring',
]

for (const token of requiredTokens) {
  if (!css.includes(token)) fail(`missing design token ${token}`)
  else pass(`token exists ${token}`)
}

const requiredUtilities = [
  '.surface-dark-panel',
  '.btn-primary',
  '.control-card',
  '.control-field',
  '.three-plus-marker',
]

for (const utility of requiredUtilities) {
  if (!css.includes(utility)) fail(`missing utility ${utility}`)
  else pass(`utility exists ${utility}`)
}

if (css.includes('@keyframes modSnap')) {
  fail('old modSnap animation must be removed')
} else {
  pass('old modSnap animation removed')
}

if (!fs.existsSync(path.join(root, 'docs', 'design-system', 'tokens-v1.md'))) {
  fail('docs/design-system/tokens-v1.md is missing')
} else {
  pass('tokens documentation exists')
}

if (!ok) process.exit(1)
console.log('Design system token checks passed.')
