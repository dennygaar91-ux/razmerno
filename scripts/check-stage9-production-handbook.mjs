import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const file = path.join(root,'docs','production','PRODUCTION-HANDBOOK.md')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
if (!fs.existsSync(file)) fail('PRODUCTION-HANDBOOK missing')
else {
  const source = fs.readFileSync(file,'utf8')
  for (const token of ['Production Handbook','ADMIN_PASSWORD_HASH','npm run qa:stage9','/api/diagnostics','Stop deploy if','zustand-migration-plan.md']) {
    if (!source.includes(token)) fail(`handbook missing ${token}`)
    else pass(`handbook contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 9 production handbook checks passed.')
