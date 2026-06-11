import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root,rel),'utf8') }

const env = read('.env.production.example')
for (const token of ['ADMIN_LOGIN_PASSWORD=', 'VITE_ADMIN_LOGIN_API_URL=/api/admin/login']) {
  if (!env.includes(token)) fail(`env missing ${token}`)
  else pass(`env contains ${token}`)
}
if (env.includes('VITE_ADMIN_ACCESS_KEY')) fail('env must not contain VITE_ADMIN_ACCESS_KEY')
else pass('env removed VITE_ADMIN_ACCESS_KEY')

const doc = read('docs/production/admin-auth-v2.md')
for (const token of ['Admin Auth v2','POST /api/admin/login','ADMIN_LOGIN_PASSWORD','sessionStorage']) {
  if (!doc.includes(token)) fail(`admin auth doc missing ${token}`)
  else pass(`admin auth doc contains ${token}`)
}
if (!ok) process.exit(1)
console.log('Stage 7 admin auth docs checks passed.')
