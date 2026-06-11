import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const [rel,tokens] of [
  ['docs/production/incident-response.md',['Incident response','Rollback','requestId','Stop conditions']],
  ['docs/production/support-debug-toolkit.md',['Support debug toolkit','X-Request-Id','PII rule','/api/diagnostics']]
]) {
  const file = path.join(root,rel)
  if (!fs.existsSync(file)) { fail(`${rel} missing`); continue }
  const source = fs.readFileSync(file,'utf8')
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 6 ops docs checks passed.')
