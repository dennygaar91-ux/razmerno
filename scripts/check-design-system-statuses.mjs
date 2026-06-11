import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const css = fs.readFileSync(path.join(root, 'src', 'index.css'), 'utf8')
const steps = fs.readFileSync(path.join(root, 'src', 'configurator', 'steps.tsx'), 'utf8')
const mobile = fs.readFileSync(path.join(root, 'src', 'configurator', 'MobileBottomBar.tsx'), 'utf8')
let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

for (const token of ['.rzm-status', 'data-status="error"', 'data-status="warning"', 'data-status="success"']) {
  if (!css.includes(token) && !steps.includes(token) && !mobile.includes(token)) fail(`missing status system token ${token}`)
  else pass(`status token present ${token}`)
}

if (!steps.includes('className="rzm-status"')) fail('FieldMessages must use rzm-status')
else pass('FieldMessages uses rzm-status')

if (!mobile.includes('rzm-status')) fail('MobileBottomBar validation strip must use rzm-status')
else pass('MobileBottomBar uses rzm-status')

if (!ok) process.exit(1)
console.log('Design system status checks passed.')
