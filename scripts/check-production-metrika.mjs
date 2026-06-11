import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const analytics = read('src/shared/lib/analytics.ts')
for (const token of ['VITE_YANDEX_METRIKA_ID','initYandexMetrika','mc.yandex.ru/metrika/tag.js','accurateTrackBounce']) {
  if (!analytics.includes(token)) fail(`analytics missing ${token}`)
  else pass(`analytics contains ${token}`)
}

const main = read('src/main.tsx')
if (!main.includes('initYandexMetrika();')) fail('main.tsx must call initYandexMetrika')
else pass('main initializes metrika')

const doc = path.join(root, 'docs', 'production', 'yandex-metrika.md')
if (!fs.existsSync(doc)) fail('metrika docs missing')
else pass('metrika docs exist')

if (!ok) process.exit(1)
console.log('Production metrika checks passed.')
