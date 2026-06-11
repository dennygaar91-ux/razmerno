import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const ordersPath = path.join(root, 'api', 'orders.ts')
const checkoutPath = path.join(root, 'src', 'configurator', 'CheckoutDrawer.tsx')

let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

function requireIncludes(source, token, label) {
  if (!source.includes(token)) fail(label)
  else pass(label)
}

const orders = fs.readFileSync(ordersPath, 'utf8')
const checkout = fs.readFileSync(checkoutPath, 'utf8')

requireIncludes(orders, 'DEFAULT_ALLOWED_ORIGINS', 'orders API has default allowed origins')
requireIncludes(orders, 'https://razmerno.ru', 'orders API includes razmerno.ru origin')
requireIncludes(orders, 'Access-Control-Allow-Origin', 'orders API sets CORS origin')
requireIncludes(orders, 'isAllowedOrigin', 'orders API checks request origin')
requireIncludes(orders, 'orders.origin_rejected', 'orders API logs blocked origin')
requireIncludes(orders, 'UPSTASH_REDIS_REST_URL', 'orders API supports Upstash rate-limit')
requireIncludes(orders, 'isRateLimited', 'orders API enforces rate-limit')
requireIncludes(orders, 'body.honeypot?.trim()', 'orders API rejects honeypot submissions')
requireIncludes(orders, 'Idempotency-Key', 'orders API allows Idempotency-Key header')
requireIncludes(orders, 'calculateServerPrice', 'orders API recalculates server price')
requireIncludes(orders, 'withServerPrice', 'orders API overwrites client price with server price')
requireIncludes(orders, 'validateOrderLayout', 'orders API validates layout payload')

requireIncludes(checkout, 'const [company, setCompany]', 'checkout has honeypot state')
requireIncludes(checkout, 'name="company"', 'checkout has hidden honeypot input')
requireIncludes(checkout, 'honeypot: company', 'checkout sends honeypot value')
requireIncludes(checkout, 'secondsSinceLastSubmit', 'checkout has client-side anti-spam delay')

if (!ok) process.exit(1)
console.log('Order security checks passed.')
