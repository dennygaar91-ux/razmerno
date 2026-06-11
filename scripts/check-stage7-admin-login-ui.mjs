import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','admin','AdminOrdersPage.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['ADMIN_LOGIN_API_URL','/api/admin/login','loginAdmin','sessionStorage.setItem(ADMIN_SESSION_KEY, nextToken)','onLogout','Выйти']) {
  if (!source.includes(token)) fail(`admin login UI missing ${token}`)
  else pass(`admin login UI contains ${token}`)
}
if (source.includes('VITE_ADMIN_ACCESS_KEY')) fail('admin UI must not use VITE_ADMIN_ACCESS_KEY')
else pass('admin UI does not use VITE_ADMIN_ACCESS_KEY')
if (!ok) process.exit(1)
console.log('Stage 7 admin login UI checks passed.')
