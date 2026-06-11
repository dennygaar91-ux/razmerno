import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(message) { console.error(`✗ ${message}`); ok = false }
function pass(message) { console.log(`✓ ${message}`) }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8') }

const orders = read('api/orders.ts')
const forbiddenInOrders = [
  'function buildManagerText',
  'function buildClientText',
  'function sendEmail',
  'function applyCorsHeaders',
  'function isRateLimited',
  'function validateOrder',
  'const RATE_LIMIT_WINDOW_MS',
  'DEFAULT_ALLOWED_ORIGINS',
]

for (const token of forbiddenInOrders) {
  if (orders.includes(token)) fail(`api/orders.ts contains extracted token: ${token}`)
  else pass(`api/orders.ts does not contain ${token}`)
}

const requiredModules = [
  'api/_shared/order-email.ts',
  'api/_shared/order-cors.ts',
  'api/_shared/order-rate-limit.ts',
  'api/_shared/order-validation.ts',
  'api/_shared/serverless-types.ts',
  'docs/BACKLOG.md',
]

for (const rel of requiredModules) {
  if (!fs.existsSync(path.join(root, rel))) fail(`${rel} missing`)
  else pass(`${rel} exists`)
}

const packageJson = JSON.parse(read('package.json'))
for (const script of ['qa:core','qa:frontend','qa:api','qa:production','qa:admin','qa:cleanup','qa:all:normalized']) {
  if (!packageJson.scripts?.[script]) fail(`package.json missing ${script}`)
  else pass(`package.json has ${script}`)
}

const orderLines = orders.split('\n').length
if (orderLines > 220) fail(`api/orders.ts too large after cleanup: ${orderLines} lines`)
else pass(`api/orders.ts line count is acceptable: ${orderLines}`)

if (!ok) process.exit(1)
console.log('Stage 19 architecture guard checks passed.')
