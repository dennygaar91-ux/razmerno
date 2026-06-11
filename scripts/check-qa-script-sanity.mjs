import fs from 'node:fs'
import path from 'node:path'

const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'))
const qa = pkg.scripts?.['qa:all'] ?? ''
const parts = qa.split('&&').map((part) => part.trim()).filter(Boolean)
const unique = new Set(parts)
let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

if (parts.length !== unique.size) fail('qa:all contains duplicate commands')
else pass('qa:all has no duplicate commands')

if (parts.includes('npm run build')) fail('qa:all should not include build; build runs separately in final QA')
else pass('qa:all does not include build')

if (!pkg.scripts?.['qa:stage2']) fail('qa:stage2 script missing')
else pass('qa:stage2 script exists')

if (!ok) process.exit(1)
console.log('QA script sanity checks passed.')
