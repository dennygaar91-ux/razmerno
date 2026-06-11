import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(message) { console.error(`✗ ${message}`); ok = false }
function pass(message) { console.log(`✓ ${message}`) }

const allowed = new Set([
  'src/configurator/context.tsx',
  'src/configurator/store/useConfigBridge.ts',
  'src/configurator/store/providerStoreSync.test.ts',
  'src/configurator/store/zustandBridge.test.tsx',
])

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
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
  if (source.includes('useConfig(') && !allowed.has(rel)) offenders.push(rel)
}

if (offenders.length > 0) fail(`Unexpected direct useConfig consumers: ${offenders.join(', ')}`)
else pass('direct useConfig is limited to context/bridge compatibility layer')

const plan = fs.readFileSync(path.join(root, 'docs/CONTEXT_REMOVAL_PLAN.md'), 'utf8')
for (const token of ['Pure state engine','Zustand owns reducer','Bridge without context','Remove context']) {
  if (!plan.includes(token)) fail(`CONTEXT_REMOVAL_PLAN missing ${token}`)
  else pass(`CONTEXT_REMOVAL_PLAN contains ${token}`)
}

if (!ok) process.exit(1)
console.log('Stage 26 context removal readiness checks passed.')
