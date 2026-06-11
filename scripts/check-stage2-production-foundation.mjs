import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['src/pricing/assembly.ts', ['ASSEMBLY_RATE = 0.1', 'calculateAssemblyQuote']],
  ['src/pricing/delivery.ts', ['DELIVERY_MKAD_PRICE = 6000', 'DELIVERY_OUTSIDE_MKAD_PRICE_PER_KM = 50']],
  ['src/configurator/CheckoutDrawer.tsx', ['Заказать сборку', 'assemblyEnabled', 'assemblyQuote']],
  ['api/orders.ts', ['validateAssembly', 'Стоимость сборки рассчитана некорректно']],
  ['api/_shared/order-types.ts', ['assembly_enabled', 'assembly_price']],
  ['supabase/migrations/20260526_add_order_assembly_fields.sql', ['assembly_enabled', 'assembly_base_price']],
  ['src/admin/AdminOrdersPage.tsx', ['VITE_ADMIN_ACCESS_KEY', 'Мониторинг заявок']],
  ['src/shared/lib/analytics.ts', ['VITE_YANDEX_METRIKA_ID', 'initYandexMetrika']],
  ['docs/production/release-checklist.md', ['npm run qa:stage2', 'Known MVP limitations']],
  ['docs/history/STAGE_02_FINAL_REPORT.md', ['Stage 2 Final Report', 'Scope verification']],
]

for (const [rel, tokens] of checks) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) {
    fail(`${rel} missing`)
    continue
  }
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

const pkg = JSON.parse(read('package.json'))
for (const script of ['qa:stage2', 'check:stage2-production-foundation', 'check:qa-script-sanity']) {
  if (!pkg.scripts?.[script]) fail(`package script missing ${script}`)
  else pass(`package script exists ${script}`)
}

if (!ok) process.exit(1)
console.log('Stage 2 production foundation checks passed.')
