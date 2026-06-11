import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const allowed = new Set([
  'src/configurator/context.tsx',
  'src/configurator/store/providerStoreSync.test.ts',
  'src/configurator/store/zustandBridge.test.tsx',
  'src/configurator/store/zustandReadConsumers.test.tsx',
  'src/configurator/store/useConfigBridge.ts',
])

let ok = true
function fail(message) { console.error(`✗ ${message}`); ok = false }
function pass(message) { console.log(`✓ ${message}`) }

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') return []
      return walk(full)
    }
    return [full]
  })
}

const files = walk(path.join(root, 'src'))
  .filter((file) => /\.(ts|tsx)$/.test(file))
  .map((file) => path.relative(root, file).replaceAll('\\', '/'))

const offenders = []
for (const rel of files) {
  const source = fs.readFileSync(path.join(root, rel), 'utf8')
  if (!source.includes('useConfig(')) continue
  if (!allowed.has(rel)) offenders.push(rel)
}

if (offenders.length > 0) {
  fail(`Unexpected useConfig() usage: ${offenders.join(', ')}`)
} else {
  pass('useConfig() remains only in allowed compatibility/test files')
}

const checkout = fs.readFileSync(path.join(root, 'src/configurator/CheckoutDrawer.tsx'), 'utf8')
if (checkout.includes('submitOrder(') || checkout.includes('buildCheckoutOrderPayload(')) {
  fail('CheckoutDrawer owns submit orchestration')
} else {
  pass('CheckoutDrawer delegates submit orchestration')
}

if (!ok) process.exit(1)
console.log('Stage 24 legacy config usage checks passed.')
