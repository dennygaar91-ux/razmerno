import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const steps = fs.readFileSync(path.join(root, 'src', 'configurator', 'steps.tsx'), 'utf8')
let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

if (!steps.includes('HelpTooltip')) fail('steps.tsx must use HelpTooltip')
else pass('steps.tsx uses HelpTooltip')

if (!steps.includes('DIMENSION_HELP')) fail('dimension help copy missing')
else pass('dimension help copy exists')

if (!steps.includes('rzm-field-label')) fail('rzm-field-label not adopted')
else pass('rzm-field-label adopted')

const help = fs.readFileSync(path.join(root, 'src', 'shared', 'ui', 'HelpTooltip.tsx'), 'utf8')
if (!help.includes('tabIndex={0}')) fail('HelpTooltip must be keyboard focusable')
else pass('HelpTooltip is keyboard focusable')

if (!ok) process.exit(1)
console.log('Design system tooltip checks passed.')
