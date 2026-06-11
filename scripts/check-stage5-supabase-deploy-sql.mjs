import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

const file = path.join(root, 'supabase', 'deploy', 'deploy-all.sql')
if (!fs.existsSync(file)) fail('deploy-all.sql missing')
else {
  const source = fs.readFileSync(file, 'utf8')
  for (const token of ['begin;', 'assembly_enabled', 'order_status_events', 'commit;', 'Manual verification']) {
    if (!source.includes(token)) fail(`deploy-all.sql missing ${token}`)
    else pass(`deploy-all.sql contains ${token}`)
  }
}

const doc = path.join(root, 'docs', 'production', 'supabase-deploy-sql.md')
if (!fs.existsSync(doc)) fail('supabase deploy sql docs missing')
else pass('supabase deploy sql docs exist')

if (!ok) process.exit(1)
console.log('Stage 5 Supabase deploy SQL checks passed.')
