import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const file = path.join(root, 'docs', 'production', 'vercel-env-fill-guide.md')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

if (!fs.existsSync(file)) fail('vercel env fill guide missing')
else {
  const source = fs.readFileSync(file, 'utf8')
  for (const token of ['Server-only variables', 'Frontend variables', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_*', 'ADMIN_API_KEY', 'VITE_ADMIN_ACCESS_KEY']) {
    if (!source.includes(token)) fail(`env guide missing ${token}`)
    else pass(`env guide contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 5 Vercel env guide checks passed.')
