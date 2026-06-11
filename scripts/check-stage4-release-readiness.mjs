import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const [rel, tokens] of [
  ['docs/production/release-checklist.md', ['Stage 4 deploy verification', '/api/health', 'robots.txt', 'ADMIN_API_KEY can be rotated']],
  ['docs/production/stage4-deploy-readiness.md', ['npm run predeploy:guard', 'npm run smoke:deploy', 'Stop deploy if']],
]) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) {
    fail(`${rel} missing`)
    continue
  }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 4 release readiness checks passed.')
