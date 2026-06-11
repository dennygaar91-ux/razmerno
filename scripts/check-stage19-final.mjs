import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel),'utf8') }

const checks = [
  ['docs/BACKLOG.md',['Backlog','Zustand','Автогенерация `.b3d`']],
  ['api/_shared/order-email.ts',['buildManagerText','sendEmail']],
  ['api/_shared/order-cors.ts',['applyCorsHeaders','isAllowedOrigin']],
  ['api/_shared/order-rate-limit.ts',['isRateLimited','getClientKey']],
  ['api/_shared/order-validation.ts',['validateOrder','validateDelivery']],
  ['api/_shared/serverless-types.ts',['ServerlessRequest','ServerlessResponse']],
  ['scripts/check-stage19-architecture-guard.mjs',['api/orders.ts','forbiddenInOrders']],
  ['docs/history/STAGE_19_FINAL_REPORT.md',['Codebase Cleanup','Scope verification']]
]

for (const [rel,tokens] of checks) {
  if (!fs.existsSync(path.join(root, rel))) { fail(`${rel} missing`); continue }
  const source=read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

const orders=read('api/orders.ts')
if (orders.includes('function sendEmail') || orders.includes('function applyCorsHeaders') || orders.includes('function validateOrder')) {
  fail('api/orders.ts still contains extracted helper functions')
} else {
  pass('api/orders.ts remains thin')
}

if (!ok) process.exit(1)
console.log('Stage 19 final checks passed.')
