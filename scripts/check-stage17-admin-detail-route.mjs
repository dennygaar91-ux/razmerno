import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const [rel,tokens] of [
  ['src/App.tsx',['routePath={route.pathname}']],
  ['src/admin/AdminOrdersPage.tsx',['routeOrderId','/admin/orders/','Детальная заявка','Открыть detail']]
]) {
  const file = path.join(root, rel)
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 17 admin detail route checks passed.')
