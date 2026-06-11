import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
const source = fs.readFileSync(path.join(root, 'src', 'admin', 'AdminOrdersPage.tsx'), 'utf8')
for (const token of ['VITE_ADMIN_ACCESS_KEY','ADMIN_SESSION_KEY','sessionStorage','AdminOrdersDashboard','Доступ к заявкам']) {
  if (!source.includes(token)) fail(`Admin access missing ${token}`)
  else pass(`Admin access contains ${token}`)
}
const docPath = path.join(root, 'docs', 'production', 'admin-access.md')
if (!fs.existsSync(docPath)) fail('admin access docs missing')
else pass('admin access docs exist')
if (!ok) process.exit(1)
console.log('Production admin access checks passed.')
