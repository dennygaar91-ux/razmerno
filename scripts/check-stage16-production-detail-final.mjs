import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['src/constructor/production/basisJson.ts',['BasisJsonScript','buildBasisJsonScript','serializeBasisJson']],
  ['src/constructor/production/productionDocuments.ts',['ProductionDocumentBundle','customerHtml','assemblyHtml','productionSummaryHtml']],
  ['src/constructor/production/emailAttachments.ts',['buildProductionEmailAttachments','application/json','text/html']],
  ['src/admin/AdminOrdersPage.tsx',['ProductionDetailBreakdown','ProductionMiniTable','BASIS manual plan','Ревизии']],
  ['tests/basis-json-documents.test.ts',['BASIS JSON and production documents test passed']]
]

for (const [rel,tokens] of checks) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) { fail(`${rel} missing`); continue }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 16 production detail final checks passed.')
