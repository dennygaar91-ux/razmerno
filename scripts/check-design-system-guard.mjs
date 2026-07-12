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

const constructorCssDir = path.join(root, 'src', 'styles', 'constructor3d')
if (!fs.existsSync(constructorCssDir)) {
  fail('missing constructor3d css directory')
} else {
  pass('constructor3d css directory exists')
  const constructorCssFiles = fs.readdirSync(constructorCssDir).filter((name) => name.endsWith('.css'))
  const constructorCss = constructorCssFiles
    .map((name) => fs.readFileSync(path.join(constructorCssDir, name), 'utf8'))
    .join('\n')
  const tokenUsage = (constructorCss.match(/var\(--rzm-[^)]+\)/g) ?? []).length
  const rawHexUsage = (constructorCss.match(/#[0-9A-Fa-f]{3,8}\b/g) ?? []).length
  const RAW_HEX_INVENTORY_BASELINE = 175
  if (tokenUsage < 20) fail(`constructor3d css token usage too low (${tokenUsage})`)
  else pass(`constructor3d css uses design tokens (${tokenUsage} var(--rzm-*) refs)`)
  if (rawHexUsage > RAW_HEX_INVENTORY_BASELINE) {
    fail(`constructor3d css raw hex inventory grew beyond baseline (${rawHexUsage} > ${RAW_HEX_INVENTORY_BASELINE})`)
  } else {
    pass(`constructor3d css raw hex inventory within baseline (${rawHexUsage}/${RAW_HEX_INVENTORY_BASELINE})`)
  }
}

const constructor3dPage = fs.readFileSync(path.join(root, 'src', 'static-pages', 'Constructor3DPage.tsx'), 'utf8')
if (!constructor3dPage.includes('className="rzm-3d-page"')) {
  fail('Constructor3DPage missing rzm-3d-page root class')
} else {
  pass('Constructor3DPage keeps rzm-3d-page root class')
}

if (!ok) process.exit(1)
console.log('Design system guard checks passed.')
