import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const file = path.join(root, 'docs', 'production', 'release-checklist.md')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

if (!fs.existsSync(file)) fail('release checklist missing')
else {
  const source = fs.readFileSync(file, 'utf8')
  for (const token of [
    'npm run qa:stage2',
    'supabase/migrations/20260526_add_order_assembly_fields.sql',
    'VITE_YANDEX_METRIKA_ID',
    'Create order with assembly +10%',
    'Known MVP limitations',
  ]) {
    if (!source.includes(token)) fail(`release checklist missing ${token}`)
    else pass(`release checklist contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Production release checklist checks passed.')
