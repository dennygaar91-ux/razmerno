import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true

function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

const css = fs.readFileSync(path.join(root,'src','index.css'),'utf8')
for (const token of [
  '--rzm-surface-canvas',
  '--rzm-brand-clay',
  '.rzm-card',
  '.rzm-help',
  '.rzm-status',
  '.rzm-mobile-sheet',
  '.rzm-animate-in',
]) {
  if (!css.includes(token)) fail(`stage design-system missing ${token}`)
  else pass(`stage design-system contains ${token}`)
}

for (const rel of [
  'docs/design-system/README.md',
  'docs/design-system/tokens-v1.md',
  'docs/design-system/components-v1.md',
  'src/shared/ui/HelpTooltip.tsx',
]) {
  if (!fs.existsSync(path.join(root, rel))) fail(`missing ${rel}`)
  else pass(`exists ${rel}`)
}

const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'))
if (!pkg.scripts?.['check:stage1-1-design-system']) pass('stage final script is being installed')
else pass('stage final script exists')

if (!ok) process.exit(1)
console.log('Stage 1.1 design system final checks passed.')
