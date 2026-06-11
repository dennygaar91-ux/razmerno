import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const requiredFiles = [
  'src/shared/lib/order.ts',
  'src/shared/lib/analytics.ts',
  'api/orders.ts',
  'api/config.ts',
  '.env.example',
  'QA_MANUAL_CHECKLIST.md',
  'DEPLOYMENT_PRODUCTION.md',
  'FURNITURE_LOGIC_QA.md',
  'public/privacy.html',
  'public/robots.txt',
  'public/sitemap.xml',
  'src/config/materials.json',
  'src/config/facade-styles.json',
  'src/config/hardware.json',
  'src/config/furniture-presets.json',
  'src/config/filling-presets.json',
  'src/config/limits.json',
  'src/config/pricing.json',
  'src/config/manifest.json',
  'src/config/index.ts',
]

let ok = true

for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(root, file))
  console.log(`${exists ? '✓' : '✗'} ${file}`)
  if (!exists) ok = false
}

const order = fs.readFileSync(path.join(root, 'src/shared/lib/order.ts'), 'utf8')
if (!order.includes('/api/orders') || !order.includes('VITE_USE_MOCK_API') || !order.includes('consent')) {
  console.error('✗ order.ts must support /api/orders, VITE_USE_MOCK_API and consent')
  ok = false
}

const analytics = fs.readFileSync(path.join(root, 'src/shared/lib/analytics.ts'), 'utf8')
if (!analytics.includes('VITE_YM_ID') || !analytics.includes('trackPageView')) {
  console.error('✗ analytics.ts must support VITE_YM_ID and trackPageView')
  ok = false
}

const checkoutConsentFiles = [
  'src/configurator/CheckoutDrawer.tsx',
  'src/configurator/checkout/CheckoutSubmitBlock.tsx',
]
  .map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
  .join('\n')

if (!checkoutConsentFiles.includes('Политика конфиденциальности') || !checkoutConsentFiles.includes('consent')) {
  console.error('✗ Checkout flow must require privacy consent')
  ok = false
}

if (!ok) process.exit(1)
console.log('Static QA checks passed.')
