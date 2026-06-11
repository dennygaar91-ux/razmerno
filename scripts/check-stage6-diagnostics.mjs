import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const file = path.join(root,'api','diagnostics.ts')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
if (!fs.existsSync(file)) fail('api/diagnostics.ts missing')
else {
  const source = fs.readFileSync(file,'utf8')
  for (const token of ['validateAdminRequest','getDiagnosticsPayload','uptimeSec','rateLimitExternal','diagnostics.read','applyRequestIdHeader']) {
    if (!source.includes(token)) fail(`diagnostics missing ${token}`)
    else pass(`diagnostics contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 6 diagnostics checks passed.')
