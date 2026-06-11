import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const file = path.join(root, 'docs', 'production', 'post-deploy-manual-smoke.md')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

if (!fs.existsSync(file)) fail('post-deploy manual smoke doc missing')
else {
  const source = fs.readFileSync(file, 'utf8')
  for (const token of ['https://razmerno.ru/api/health', 'Доставка внутри МКАД', 'Доставка за МКАД + сборка', 'status history', 'Stop conditions']) {
    if (!source.includes(token)) fail(`post-deploy smoke missing ${token}`)
    else pass(`post-deploy smoke contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 5 post-deploy smoke checks passed.')
