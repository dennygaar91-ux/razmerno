import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

const serverPath = path.join(root, 'server')
if (fs.existsSync(serverPath)) {
  fail('/server directory must not exist for Vercel MVP backend')
} else {
  pass('/server directory is absent')
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const scripts = pkg.scripts ?? {}
const badScripts = Object.entries(scripts).filter(([, value]) => String(value).includes('server/'))

if (badScripts.length) {
  for (const [name, value] of badScripts) fail(`package script ${name} references server/: ${value}`)
} else {
  pass('package scripts do not reference server/')
}

if (!fs.existsSync(path.join(root, 'api', 'orders.ts'))) {
  fail('api/orders.ts must exist as active Vercel order endpoint')
} else {
  pass('api/orders.ts exists')
}

if (!ok) process.exit(1)
console.log('No-server checks passed.')
