import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

const migrationPath = path.join(root, 'supabase', 'migrations', '20260526_add_order_assembly_fields.sql')
if (!fs.existsSync(migrationPath)) fail('assembly migration sql missing')
else {
  const sql = fs.readFileSync(migrationPath, 'utf8')
  for (const token of ['assembly_enabled','assembly_price','assembly_rate','assembly_base_price','if not exists']) {
    if (!sql.includes(token)) fail(`migration missing ${token}`)
    else pass(`migration contains ${token}`)
  }
}

const docPath = path.join(root, 'docs', 'production', 'supabase-assembly-migration.md')
if (!fs.existsSync(docPath)) fail('assembly migration docs missing')
else pass('assembly migration docs exist')

if (!ok) process.exit(1)
console.log('Production assembly migration checks passed.')
