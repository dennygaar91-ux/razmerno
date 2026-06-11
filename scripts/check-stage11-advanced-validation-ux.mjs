import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }
const filling = read('src/configurator/steps/FillingStep.tsx')
for (const token of ['Профессиональная настройка','Профи-режим включён','редактирование каждого блока']) {
  if (!filling.includes(token)) fail(`FillingStep missing ${token}`)
  else pass(`FillingStep contains ${token}`)
}
const review = read('src/configurator/steps/ReviewStep.tsx')
if (!review.includes('Исправить первую ошибку')) fail('ReviewStep missing error jump CTA')
else pass('ReviewStep contains error jump CTA')
if (!ok) process.exit(1)
console.log('Stage 11 advanced validation UX checks passed.')
