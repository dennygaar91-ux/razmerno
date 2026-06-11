import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root,rel),'utf8') }

const checks = [
  ['api/_shared/request-context.ts',['getRequestId','X-Request-Id','getClientIpHash']],
  ['api/_shared/logger.ts',['BLOCKED_KEYS','service: "razmerno-api"','safeErrorMessage','[redacted]']],
  ['api/diagnostics.ts',['validateAdminRequest','getDiagnosticsPayload','diagnostics.read']],
  ['api/orders.ts',['applyRequestIdHeader(res, requestId)','orders.env_not_ready']],
  ['api/health.ts',['applyRequestIdHeader(res, requestId)']],
  ['src/shared/components/AppErrorBoundary.tsx',['frontend.runtime_error','Что-то пошло не так']],
  ['docs/production/incident-response.md',['Incident response','Rollback','Stop conditions']],
  ['docs/production/support-debug-toolkit.md',['X-Request-Id','PII rule']]
]

for (const [rel,tokens] of checks) {
  const file = path.join(root,rel)
  if (!fs.existsSync(file)) { fail(`${rel} missing`); continue }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

const pkg = JSON.parse(read('package.json'))
for (const script of ['qa:stage6','check:stage6-ops-hardening-final']) {
  if (!pkg.scripts?.[script]) fail(`package script missing ${script}`)
  else pass(`package script exists ${script}`)
}
if (!ok) process.exit(1)
console.log('Stage 6 ops hardening final checks passed.')
