import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const css = fs.readFileSync(path.join(root,'src','index.css'),'utf8')
let ok = true

function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

const forbidden = [
  '@keyframes modSnap',
]

for (const token of forbidden) {
  if (css.includes(token)) fail(`forbidden legacy CSS found: ${token}`)
  else pass(`forbidden legacy CSS absent: ${token}`)
}

const requiredDocs = [
  'docs/design-system/README.md',
  'docs/design-system/tokens-v1.md',
  'docs/design-system/components-v1.md',
]
for (const rel of requiredDocs) {
  if (!fs.existsSync(path.join(root, rel))) fail(`missing design-system doc ${rel}`)
  else pass(`design-system doc exists ${rel}`)
}

const requiredScripts = [
  'check:design-system-tokens',
  'check:design-system-components',
  'check:design-system-adoption',
  'check:design-system-tooltips',
  'check:design-system-statuses',
  'check:design-system-surfaces',
  'check:design-system-mobile',
  'check:design-system-motion',
]
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'))
for (const script of requiredScripts) {
  if (!pkg.scripts?.[script]) fail(`missing package script ${script}`)
  else pass(`package script exists ${script}`)
}

if (!ok) process.exit(1)
console.log('Design system guard checks passed.')
