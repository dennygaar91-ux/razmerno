import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const file = path.join(root, 'docs', 'production', 'stage3-admin-checklist.md')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

if (!fs.existsSync(file)) fail('stage3 checklist missing')
else {
  const source = fs.readFileSync(file, 'utf8')
  for (const token of [
    'ADMIN_API_KEY',
    'order_status_events',
    'PII is masked',
    'Status update works',
    'Known limitations',
  ]) {
    if (!source.includes(token)) fail(`stage3 checklist missing ${token}`)
    else pass(`stage3 checklist contains ${token}`)
  }
}

if (!ok) process.exit(1)
console.log('Stage 3 checklist checks passed.')
