import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','components','HeaderReworked.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['Как устроено','Наборы','--rzm-text-main','--rzm-line-soft','/configurator']) {
  if (!source.includes(token)) fail(`Header missing ${token}`)
  else pass(`Header contains ${token}`)
}
if (source.includes('var(--color-ink)') || source.includes('var(--color-mute)')) fail('Header should not use old color tokens')
else pass('Header old color tokens removed')
if (!ok) process.exit(1)
console.log('Landing header checks passed.')
