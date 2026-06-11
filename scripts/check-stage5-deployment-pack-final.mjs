import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['GO-LIVE.md', ['GO-LIVE', 'supabase/deploy/deploy-all.sql', 'npm run smoke:deploy']],
  ['supabase/deploy/deploy-all.sql', ['assembly_enabled', 'order_status_events', 'commit;']],
  ['docs/production/supabase-deploy-sql.md', ['Verification SQL']],
  ['docs/production/windows-deploy-commands.md', ['PowerShell', 'git push origin main']],
  ['docs/production/vercel-env-fill-guide.md', ['Server-only variables', 'Frontend variables']],
  ['docs/production/post-deploy-manual-smoke.md', ['Health', 'Admin', 'Stop conditions']],
  ['docs/production/vercel-deploy-runbook.md', ['Post-deploy smoke']],
  ['docs/production/stage4-deploy-readiness.md', ['Stop deploy if']],
]

for (const [rel, tokens] of checks) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) {
    fail(`${rel} missing`)
    continue
  }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

const pkg = JSON.parse(read('package.json'))
for (const script of ['qa:stage5', 'smoke:deploy', 'predeploy:guard', 'check:stage5-deployment-pack-final']) {
  if (!pkg.scripts?.[script]) fail(`package script missing ${script}`)
  else pass(`package script exists ${script}`)
}

if (!ok) process.exit(1)
console.log('Stage 5 deployment pack final checks passed.')
