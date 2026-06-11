#!/usr/bin/env node
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

function exists(rel) {
  return fs.existsSync(path.join(root, rel))
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

const requiredFiles = [
  '.env.production.example',
  'supabase/migrations/20260526_add_order_assembly_fields.sql',
  'supabase/migrations/20260526_add_order_status_events.sql',
  'docs/production/release-checklist.md',
  'docs/production/admin-supabase-integration.md',
  'docs/production/deploy-smoke.md',
  'api/health.ts',
]

for (const rel of requiredFiles) {
  if (!exists(rel)) fail(`missing ${rel}`)
  else pass(`exists ${rel}`)
}

const env = exists('.env.production.example') ? read('.env.production.example') : ''
for (const token of ['ADMIN_API_KEY=', 'ALLOWED_ORIGINS=https://razmerno.ru', 'SUPABASE_URL=', 'RESEND_API_KEY=', 'VITE_YANDEX_METRIKA_ID=']) {
  if (!env.includes(token)) fail(`env example missing ${token}`)
  else pass(`env example contains ${token}`)
}

const pkg = JSON.parse(read('package.json'))
for (const script of ['qa:stage4', 'smoke:deploy', 'check:stage4-health-env', 'check:stage4-fail-fast']) {
  if (!pkg.scripts?.[script]) fail(`package script missing ${script}`)
  else pass(`package script exists ${script}`)
}

if (!ok) process.exit(1)
console.log('Predeploy guard passed.')
