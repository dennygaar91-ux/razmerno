import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const rel of ['src/configurator/store/configSelectors.ts','src/configurator/store/configActions.ts']) {
  if (!fs.existsSync(path.join(root, rel))) fail(`${rel} missing`)
  else pass(`${rel} exists`)
}
const store = fs.readFileSync(path.join(root,'src/configurator/store/configStore.ts'),'utf8')
if (store.includes('MATERIALS') || store.includes('calculatePrice,')) fail('configStore still owns selector dependencies')
else pass('configStore no longer owns selector dependencies')
const actions = fs.readFileSync(path.join(root,'src/configurator/store/configActions.ts'),'utf8')
for (const token of ['createConfigActions','setDimension','openCheckout','clearOrderStatus']) {
  if (!actions.includes(token)) fail(`configActions missing ${token}`)
  else pass(`configActions contains ${token}`)
}
if (!ok) process.exit(1)
console.log('Stage 10 Zustand foundation checks passed.')
