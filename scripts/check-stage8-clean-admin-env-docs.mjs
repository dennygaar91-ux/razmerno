import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const docsDir = path.join(root, 'docs', 'production')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const file of fs.readdirSync(docsDir)) {
  if (!file.endsWith('.md')) continue
  const source = fs.readFileSync(path.join(docsDir, file), 'utf8')
  if (source.includes('VITE_ADMIN_ACCESS_KEY')) fail(`${file} still contains VITE_ADMIN_ACCESS_KEY`)
}
if (ok) pass('production docs do not contain VITE_ADMIN_ACCESS_KEY')
const authDoc = fs.readFileSync(path.join(docsDir, 'admin-auth-v2.md'), 'utf8')
if (!authDoc.includes('ADMIN_LOGIN_PASSWORD')) fail('admin-auth-v2 must mention ADMIN_LOGIN_PASSWORD')
else pass('admin-auth-v2 mentions ADMIN_LOGIN_PASSWORD')
if (!ok) process.exit(1)
console.log('Stage 8 admin env docs cleanup checks passed.')
