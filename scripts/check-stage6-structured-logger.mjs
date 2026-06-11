import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
const source = fs.readFileSync(path.join(root,'api','_shared','logger.ts'),'utf8')
for (const token of ['BLOCKED_KEYS','authorization','service: "razmerno-api"','normalizeEvent','safeErrorMessage','[redacted]']) {
  if (!source.includes(token)) fail(`logger missing ${token}`)
  else pass(`logger contains ${token}`)
}
const orders = fs.readFileSync(path.join(root,'api','orders.ts'),'utf8')
if (!orders.includes("import { logEvent, safeErrorMessage }")) fail('orders must import shared safeErrorMessage')
else pass('orders imports shared safeErrorMessage')
if (!ok) process.exit(1)
console.log('Stage 6 structured logger checks passed.')
