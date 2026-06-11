import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(message){ console.error(`✗ ${message}`); ok=false }
function pass(message){ console.log(`✓ ${message}`) }

const page = fs.readFileSync(path.join(root,'src','configurator','ConfiguratorPage.tsx'),'utf8')
if (!page.includes('rzm-card-soft')) fail('ConfiguratorPage mobile preview must use rzm-card-soft')
else pass('ConfiguratorPage uses rzm-card-soft')

if (!page.includes('var(--rzm-surface-canvas)')) fail('ConfiguratorPage must use rzm surface canvas')
else pass('ConfiguratorPage uses rzm surface canvas')

const quickPath = path.join(root,'src','configurator','QuickStart.tsx')
if (fs.existsSync(quickPath)) {
  const quick = fs.readFileSync(quickPath,'utf8')
  if (!quick.includes('--rzm-')) fail('QuickStart should use rzm tokens')
  else pass('QuickStart uses rzm tokens')
}

if (!ok) process.exit(1)
console.log('Design system surface checks passed.')
