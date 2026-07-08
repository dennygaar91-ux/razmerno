import fs from 'node:fs'
import path from 'node:path'
import { readdirSync } from 'node:fs'

const root = process.cwd()
let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

const forbiddenFrontendSecrets = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'ADMIN_API_KEY',
  'ORDER_MANAGER_EMAIL',
]

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const next = path.join(dir, item.name)
    if (item.isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(item.name)) return []
      return walk(next)
    }
      if (!/\.(ts|tsx|js|jsx|html)$/.test(item.name)) return []
      if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(item.name)) return []
      return [next]
  })
}

const frontendRoots = ['src', 'index.html', 'vite.config.ts']
const frontendFiles = frontendRoots.flatMap((entry) => {
  const full = path.join(root, entry)
  if (!fs.existsSync(full)) return []
  if (fs.statSync(full).isFile()) return [full]
  return walk(full)
})

for (const secret of forbiddenFrontendSecrets) {
  const hits = frontendFiles.filter((file) => fs.readFileSync(file, 'utf8').includes(secret))
  if (hits.length > 0) fail(`frontend bundle source references secret ${secret}: ${hits[0]}`)
  else pass(`frontend source does not reference ${secret}`)
}

const ordersSource = fs.readFileSync(path.join(root, 'api', 'orders.ts'), 'utf8')
if (!/ORDER_PREPARATION_FAILED_MESSAGE/.test(ordersSource)) {
  fail('orders handler missing preparation failure message contract')
} else {
  pass('orders handler exposes safe preparation failure response')
}

const corsSource = fs.readFileSync(path.join(root, 'api', '_shared', 'order-cors.ts'), 'utf8')
if (!/ALLOWED_ORIGINS/.test(corsSource)) {
  fail('order cors module missing ALLOWED_ORIGINS guard')
} else {
  pass('order cors module references ALLOWED_ORIGINS')
}

const loggerSource = fs.readFileSync(path.join(root, 'api', '_shared', 'logger.ts'), 'utf8')
if (!/redact|sanitize|safeErrorMessage/.test(loggerSource)) {
  fail('logger module missing PII-safe helpers')
} else {
  pass('logger module includes PII-safe helpers')
}

if (!ok) process.exit(1)
console.log('Release security checks passed.')
