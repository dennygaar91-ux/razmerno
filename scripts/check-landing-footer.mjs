import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','components','Footer.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['Перейти в конструктор','@razmerno_meb','МКАД 6 000 ₽','+50 ₽/км','MVP-режиме','/privacy.html']) {
  if (!source.includes(token)) fail(`Footer missing ${token}`)
  else pass(`Footer contains ${token}`)
}
if (!source.includes('/configurator')) fail('Footer must link to configurator')
else pass('Footer links to configurator')
if (!ok) process.exit(1)
console.log('Landing footer checks passed.')
