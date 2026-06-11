import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root, 'src/admin/AdminOrdersPage.tsx'), 'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of [
  'ProductionDetailBreakdown',
  'ProductionMiniTable',
  'Панели',
  'Фурнитура',
  'Присадка',
  'Кромка',
  'BASIS manual plan',
  'Ревизии'
]) {
  if (!source.includes(token)) fail(`Admin production detail missing ${token}`)
  else pass(`Admin production detail contains ${token}`)
}
if (!ok) process.exit(1)
console.log('Stage 16 admin production detail checks passed.')
