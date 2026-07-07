#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { loadProjectEnvFiles } from './load-project-env.mjs'

const loaded = loadProjectEnvFiles()
const port = process.env.VERCEL_DEV_PORT?.trim() || '3001'

const viteMirrors = [
  ['VITE_SUPABASE_URL', 'SUPABASE_URL'],
  ['VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'],
]
for (const [viteKey, sourceKey] of viteMirrors) {
  if (!process.env[viteKey]?.trim() && process.env[sourceKey]?.trim()) {
    process.env[viteKey] = process.env[sourceKey].trim()
  }
}

const smokeFallbacks = {
  ALLOWED_ORIGINS: 'http://localhost:5173,http://localhost:3001,http://localhost:3002,http://localhost:3003',
  RESEND_API_KEY: 're_local_smoke_placeholder_key',
  ORDER_MANAGER_EMAIL: 'manager@example.test',
  MAIL_FROM: 'Razmerno <noreply@example.test>',
}
for (const [key, value] of Object.entries(smokeFallbacks)) {
  if (!process.env[key]?.trim()) process.env[key] = value
}

console.log(JSON.stringify({ event: 'vercel_dev_start', port, loadedEnvFiles: loaded }))

const child = spawn('npx', ['vercel', 'dev', '--listen', port], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
})

child.on('exit', (code) => process.exit(code ?? 1))
