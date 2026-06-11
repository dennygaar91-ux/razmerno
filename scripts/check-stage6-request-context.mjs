import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const [rel, tokens] of [
  ['api/_shared/request-context.ts', ['getRequestId', 'applyRequestIdHeader', 'X-Request-Id', 'getClientIpHash']],
  ['api/orders.ts', ['getRequestId(req)', 'applyRequestIdHeader(res, requestId)']],
  ['api/health.ts', ['getRequestId(req)', 'applyRequestIdHeader(res, requestId)']],
  ['api/admin/orders.ts', ['getRequestId(req)', 'applyRequestIdHeader(res, requestId)']],
  ['api/admin/order-status.ts', ['getRequestId(req)', 'applyRequestIdHeader(res, requestId)']],
  ['api/admin/status-events.ts', ['getRequestId(req)', 'applyRequestIdHeader(res, requestId)']],
]) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) { fail(`${rel} missing`); continue }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 6 request context checks passed.')
