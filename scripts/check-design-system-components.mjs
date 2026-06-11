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

for (const cls of [
  '.rzm-card',
  '.rzm-card-soft',
  '.rzm-card-dark',
  '.rzm-chip',
  '.rzm-help',
  '.rzm-field-label',
  '.rzm-bottom-surface',
]) {
  if (!css.includes(cls)) fail(`missing component primitive ${cls}`)
  else pass(`component primitive exists ${cls}`)
}

const helpPath = path.join(root, 'src', 'shared', 'ui', 'HelpTooltip.tsx')
if (!fs.existsSync(helpPath)) {
  fail('HelpTooltip component is missing')
} else {
  const help = fs.readFileSync(helpPath, 'utf8')
  if (!help.includes('data-tooltip')) fail('HelpTooltip must use data-tooltip')
  else pass('HelpTooltip uses data-tooltip')
}

const docsPath = path.join(root, 'docs', 'design-system', 'components-v1.md')
if (!fs.existsSync(docsPath)) fail('components design-system docs missing')
else pass('components design-system docs exist')

if (!ok) process.exit(1)
console.log('Design system component checks passed.')
