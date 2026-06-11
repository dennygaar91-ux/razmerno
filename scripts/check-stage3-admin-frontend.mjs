import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const source = fs.readFileSync(path.join(root, 'src', 'admin', 'AdminOrdersPage.tsx'), 'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

for (const token of [
  'ADMIN_API_URL',
  '/api/admin/orders',
  'Authorization: `Bearer ${adminKey}`',
  'mapApiOrder',
  'Demo fallback',
  'Supabase connected',
  'managerEmail',
  'customerEmail',
]) {
  if (!source.includes(token)) fail(`Admin frontend missing ${token}`)
  else pass(`Admin frontend contains ${token}`)
}

if (!ok) process.exit(1)
console.log('Stage 3 admin frontend checks passed.')
