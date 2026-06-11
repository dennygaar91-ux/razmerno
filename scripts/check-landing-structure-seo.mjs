import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const landing = fs.readFileSync(path.join(root,'src','Landing.tsx'),'utf8')
const seo = fs.readFileSync(path.join(root,'src','components','SeoStructuredData.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['HeroReworked','FearsReworked','ProcessReworked','Support','ProjectsReworked','Faq','Footer']) {
  if (!landing.includes(token)) fail(`Landing missing ${token}`)
  else pass(`Landing contains ${token}`)
}
if (!landing.includes('--rzm-surface-canvas')) fail('Landing must use rzm surface')
else pass('Landing uses rzm surface')
if (!seo.includes("replace(/</g")) fail('JSON-LD must escape <')
else pass('JSON-LD escapes <')
if (!seo.includes('точная цена')) fail('SEO description must reflect new positioning')
else pass('SEO description updated')
if (!ok) process.exit(1)
console.log('Landing structure/SEO checks passed.')
