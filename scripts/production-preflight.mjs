import { spawnSync } from 'node:child_process'

const checks = [
  ['validate:config', ['npm', 'run', 'validate:config']],
  ['qa:static', ['npm', 'run', 'qa:static']],
  ['check:no-server', ['npm', 'run', 'check:no-server']],
  ['check:root-docs', ['npm', 'run', 'check:root-docs']],
  ['check:legacy-runtime-imports', ['npm', 'run', 'check:legacy-runtime-imports']],
  ['check:normal-urls', ['npm', 'run', 'check:normal-urls']],
  ['check:production-env', ['npm', 'run', 'check:production-env']],
  ['check:order-security', ['npm', 'run', 'check:order-security']],
  ['check:price-integrity', ['npm', 'run', 'check:price-integrity']],
  ['typecheck', ['npm', 'run', 'typecheck']],
  ['typecheck:api', ['npm', 'run', 'typecheck:api']],
  ['three-final', ['npm', 'run', 'test:three-final']],
  ['layout-final', ['npm', 'run', 'test:layout-final']],
  ['pricing-final', ['npm', 'run', 'test:pricing-final']],
  ['build', ['npm', 'run', 'build']],
  ['bundle-budget', ['npm', 'run', 'check:bundle-budget']],
  ['stage6-final', ['npm', 'run', 'check:stage6-final']],
  ['audit', ['npm', 'audit', '--audit-level=moderate']],
]

const startedAt = Date.now()
const results = []

for (const [name, command] of checks) {
  console.log(`\n=== preflight:${name} ===`)
  const res = spawnSync(command[0], command.slice(1), {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  results.push([name, res.status ?? 1])
  if ((res.status ?? 1) !== 0) break
}

console.log('\nProduction preflight summary:')
for (const [name, code] of results) {
  console.log(`  ${code === 0 ? '✓' : '✗'} ${name}`)
}

const failed = results.find(([, code]) => code !== 0)
const durationSec = ((Date.now() - startedAt) / 1000).toFixed(1)
console.log(`\nDuration: ${durationSec}s`)

if (failed) {
  console.error(`Production preflight failed at: ${failed[0]}`)
  process.exit(1)
}

console.log('Production preflight passed.')
