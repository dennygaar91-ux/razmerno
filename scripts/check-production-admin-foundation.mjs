import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }
const app = read('src/App.tsx')
for (const token of ['LazyAdminOrdersPage','isAdmin','/admin']) {
  if (!app.includes(token)) fail(`App route missing ${token}`)
  else pass(`App route contains ${token}`)
}
const adminPath = path.join(root, 'src', 'admin', 'AdminOrdersPage.tsx')
if (!fs.existsSync(adminPath)) fail('AdminOrdersPage missing')
else {
  const admin = fs.readFileSync(adminPath, 'utf8')
  for (const token of ['Мониторинг заявок','Последние заявки','Supabase connected','PII']) {
    if (!admin.includes(token)) fail(`Admin page missing ${token}`)
    else pass(`Admin page contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Production admin foundation checks passed.')
