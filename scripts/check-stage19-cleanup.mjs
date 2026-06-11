import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(message) { console.error(`✗ ${message}`); ok = false }
function pass(message) { console.log(`✓ ${message}`) }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8') }

const pkg = JSON.parse(read('package.json'))
for (const script of ['qa:core','qa:frontend','qa:api','qa:production','qa:admin','qa:cleanup','qa:all:normalized']) {
  if (!pkg.scripts?.[script]) fail(`package.json missing ${script}`)
  else pass(`package.json contains ${script}`)
}

const backlog = read('docs/BACKLOG.md')
for (const token of ['Backlog','PDF binary','Автогенерация `.b3d`','context','Zustand','Resend attachments']) {
  if (!backlog.includes(token)) fail(`BACKLOG missing ${token}`)
  else pass(`BACKLOG contains ${token}`)
}


const orderEmail = read('api/_shared/order-email.ts')
for (const token of ['buildManagerText','buildManagerAttachments','buildClientText','sendEmail']) {
  if (!orderEmail.includes(token)) fail(`order-email missing ${token}`)
  else pass(`order-email contains ${token}`)
}

for (const [rel, tokens] of [
  ['api/_shared/serverless-types.ts', ['ServerlessRequest','ServerlessResponse']],
  ['api/_shared/order-cors.ts', ['applyCorsHeaders','isAllowedOrigin','getHeader']],
  ['api/_shared/order-rate-limit.ts', ['isRateLimited','getClientKey']],
  ['api/_shared/order-validation.ts', ['validateOrder','validateOrderLayout','validateDelivery','validateAssembly']]
]) {
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

const ordersSource = read('api/orders.ts')
if (ordersSource.includes('function buildManagerText') || ordersSource.includes('function sendEmail') || ordersSource.includes('function applyCorsHeaders') || ordersSource.includes('function isRateLimited') || ordersSource.includes('function validateOrder')) {
  fail('api/orders.ts still owns extracted helper functions')
} else {
  pass('api/orders.ts no longer owns extracted helper functions')
}

if (!ok) process.exit(1)
console.log('Stage 19 cleanup checks passed.')
