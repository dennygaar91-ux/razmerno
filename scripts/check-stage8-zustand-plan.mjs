import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const file = path.join(root,'docs','architecture','zustand-migration-plan.md')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
if (!fs.existsSync(file)) fail('zustand migration plan missing')
else {
  const source = fs.readFileSync(file,'utf8')
  for (const token of ['remove legacy `useConfig/context`','Phase 1','Phase 2','Provider removal','src/configurator/context.tsx','npm run qa:all']) {
    if (!source.includes(token)) fail(`zustand plan missing ${token}`)
    else pass(`zustand plan contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 8 Zustand migration plan checks passed.')
