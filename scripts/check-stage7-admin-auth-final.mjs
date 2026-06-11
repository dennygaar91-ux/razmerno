import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['api/_shared/admin-auth.ts',['createAdminSessionToken','verifyAdminSessionToken','ADMIN_LOGIN_PASSWORD','SESSION_TTL_MS']],
  ['api/admin/login.ts',['POST','admin.login_success','expiresInSec']],
  ['src/admin/AdminOrdersPage.tsx',['ADMIN_LOGIN_API_URL','loginAdmin','sessionStorage','Выйти']],
  ['.env.production.example',['ADMIN_LOGIN_PASSWORD=','VITE_ADMIN_LOGIN_API_URL=/api/admin/login']],
  ['docs/production/admin-auth-v2.md',['Admin Auth v2','POST /api/admin/login']]
]
for (const [rel,tokens] of checks) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) { fail(`${rel} missing`); continue }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
if (read('src/admin/AdminOrdersPage.tsx').includes('VITE_ADMIN_ACCESS_KEY')) fail('frontend still uses VITE_ADMIN_ACCESS_KEY')
else pass('frontend does not use VITE_ADMIN_ACCESS_KEY')
if (read('.env.production.example').includes('VITE_ADMIN_ACCESS_KEY')) fail('env still contains VITE_ADMIN_ACCESS_KEY')
else pass('env does not contain VITE_ADMIN_ACCESS_KEY')
const pkg = JSON.parse(read('package.json'))
if (!pkg.scripts?.['qa:stage7']) fail('qa:stage7 missing')
else pass('qa:stage7 exists')
if (!ok) process.exit(1)
console.log('Stage 7 admin auth final checks passed.')
