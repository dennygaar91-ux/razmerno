import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
const envPath = path.join(root, '.env.production.example')
if (!fs.existsSync(envPath)) fail('.env.production.example missing')
else {
  const env = fs.readFileSync(envPath, 'utf8')
  for (const token of ['ALLOWED_ORIGINS=https://razmerno.ru','SUPABASE_URL','RESEND_API_KEY','VITE_ADMIN_ACCESS_KEY','VITE_YANDEX_METRIKA_ID']) {
    if (!env.includes(token)) fail(`env example missing ${token}`)
    else pass(`env example contains ${token}`)
  }
}
const docPath = path.join(root, 'docs', 'production', 'env-checklist.md')
if (!fs.existsSync(docPath)) fail('env checklist docs missing')
else pass('env checklist docs exist')
if (!ok) process.exit(1)
console.log('Production env docs checks passed.')
