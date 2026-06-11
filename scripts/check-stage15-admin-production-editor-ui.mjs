import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root, 'src/admin/AdminOrdersPage.tsx'), 'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of [
  'ProductionReviewPanel',
  'Проверить',
  'Ручная проверка production JSON',
  'Сохранить проверку',
  'approved-for-basis',
  'loadProductionDetail',
  'updateProductionReview'
]) {
  if (!source.includes(token)) fail(`Admin UI missing ${token}`)
  else pass(`Admin UI contains ${token}`)
}
if (!ok) process.exit(1)
console.log('Stage 15 admin production editor UI checks passed.')
