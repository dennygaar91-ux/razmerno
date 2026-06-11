import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

const robotsPath = path.join(root, 'public', 'robots.txt')
if (!fs.existsSync(robotsPath)) fail('robots.txt missing')
else {
  const source = fs.readFileSync(robotsPath, 'utf8')
  for (const token of ['Disallow: /admin', 'Disallow: /api/admin', 'Sitemap: https://razmerno.ru/sitemap.xml']) {
    if (!source.includes(token)) fail(`robots missing ${token}`)
    else pass(`robots contains ${token}`)
  }
}

const sitemapPath = path.join(root, 'public', 'sitemap.xml')
if (!fs.existsSync(sitemapPath)) fail('sitemap.xml missing')
else {
  const source = fs.readFileSync(sitemapPath, 'utf8')
  for (const token of ['https://razmerno.ru/', 'https://razmerno.ru/configurator']) {
    if (!source.includes(token)) fail(`sitemap missing ${token}`)
    else pass(`sitemap contains ${token}`)
  }
}

if (!ok) process.exit(1)
console.log('Stage 4 robots/sitemap checks passed.')
