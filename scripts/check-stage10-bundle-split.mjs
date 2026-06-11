import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
const vite = fs.readFileSync(path.join(root,'vite.config.ts'),'utf8')
for (const token of ['react-vendor','three-vendor','supabase-vendor','manualChunks']) {
  if (!vite.includes(token)) fail(`vite config missing ${token}`)
  else pass(`vite config contains ${token}`)
}
const page = fs.readFileSync(path.join(root,'src/configurator/ConfiguratorPage.tsx'),'utf8')
if (!page.includes('LazyProductionDebugPanel') || !page.includes('VITE_ENABLE_PRODUCTION_DEBUG')) fail('debug panel must be lazy/env-gated')
else pass('debug panel is lazy/env-gated')
if (!ok) process.exit(1)
console.log('Stage 10 bundle split checks passed.')
