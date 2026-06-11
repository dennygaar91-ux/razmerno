import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }
const errors = read('api/_shared/errors.ts')
for (const token of ['class ApiError','class ValidationError','class AuthError','class RateLimitError','class EnvError','class EmailError','sendApiError']) {
  if (!errors.includes(token)) fail(`errors missing ${token}`)
  else pass(`errors contains ${token}`)
}
const login = read('api/admin/login.ts')
for (const token of ['RateLimitError','sendApiError']) {
  if (!login.includes(token)) fail(`login missing ${token}`)
  else pass(`login contains ${token}`)
}
if (!ok) process.exit(1)
console.log('Stage 9 structured errors checks passed.')
