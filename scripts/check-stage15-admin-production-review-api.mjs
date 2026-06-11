import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

for (const [rel,tokens] of [
  ['api/_shared/admin-orders.ts',['getAdminProductionDetail','updateAdminProductionReview','appendManualRevision','ManualProductionReviewPatch']],
  ['api/admin/production-detail.ts',['getAdminProductionDetail','production_detail_failed']],
  ['api/admin/production-review.ts',['updateAdminProductionReview','production_review_updated','manually-adjusted','approved-for-basis']]
]) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) { fail(`${rel} missing`); continue }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 15 admin production review API checks passed.')
