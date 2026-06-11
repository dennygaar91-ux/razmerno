import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }
const auth = read('api/_shared/admin-auth.ts')
for (const token of ['ADMIN_PASSWORD_HASH','hashAdminPassword','createHash','/^[a-f0-9]{64}$/']) {
  if (!auth.includes(token)) fail(`admin-auth missing ${token}`)
  else pass(`admin-auth contains ${token}`)
}
if (auth.includes('ADMIN_LOGIN_PASSWORD')) fail('admin-auth still contains ADMIN_LOGIN_PASSWORD')
else pass('admin-auth removed ADMIN_LOGIN_PASSWORD')
const env = read('.env.production.example')
if (!env.includes('ADMIN_PASSWORD_HASH=')) fail('env missing ADMIN_PASSWORD_HASH')
else pass('env contains ADMIN_PASSWORD_HASH')
if (env.includes('ADMIN_LOGIN_PASSWORD=')) fail('env still contains ADMIN_LOGIN_PASSWORD')
else pass('env removed ADMIN_LOGIN_PASSWORD')
if (!ok) process.exit(1)
console.log('Stage 9 admin password hash checks passed.')
