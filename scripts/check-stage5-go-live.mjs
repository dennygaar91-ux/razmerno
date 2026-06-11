import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const file = path.join(root, 'GO-LIVE.md')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

if (!fs.existsSync(file)) fail('GO-LIVE.md missing')
else {
  const source = fs.readFileSync(file, 'utf8')
  for (const token of ['supabase/deploy/deploy-all.sql', 'npm run qa:stage5', 'git push origin main', 'npm run smoke:deploy', 'Rollback']) {
    if (!source.includes(token)) fail(`GO-LIVE missing ${token}`)
    else pass(`GO-LIVE contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 5 GO-LIVE checks passed.')
