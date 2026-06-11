import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const file = path.join(root, 'docs', 'production', 'windows-deploy-commands.md')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

if (!fs.existsSync(file)) fail('windows deploy commands doc missing')
else {
  const source = fs.readFileSync(file, 'utf8')
  for (const token of ['PowerShell', 'npm run qa:stage5', 'supabase/deploy/deploy-all.sql', 'git push origin main', 'npm run smoke:deploy', 'git revert']) {
    if (!source.includes(token)) fail(`windows deploy doc missing ${token}`)
    else pass(`windows deploy doc contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 5 Windows deploy docs checks passed.')
