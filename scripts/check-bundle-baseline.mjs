import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const distAssets = path.join(root, 'dist', 'assets')

function fail(message) {
  console.error(`✗ ${message}`)
  process.exit(1)
}

function pass(message) {
  console.log(`✓ ${message}`)
}

if (!fs.existsSync(distAssets)) {
  const build = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit', shell: true })
  if (build.status !== 0) fail('build failed before bundle baseline check')
}

const budget = spawnSync('npm', ['run', 'check:bundle-budget'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
})
if (budget.status !== 0) fail('bundle budget check failed')

const jsFiles = fs
  .readdirSync(distAssets)
  .filter((name) => name.endsWith('.js'))
  .map((name) => ({ name, bytes: fs.statSync(path.join(distAssets, name)).size }))

const threeChunk = jsFiles.find((item) => item.name.includes('three'))
const maxThreeKb = Number(process.env.THREE_CHUNK_MAX_KB ?? 700)
if (!threeChunk) fail('three chunk missing from dist/assets')
const threeKb = threeChunk.bytes / 1024
if (threeKb > maxThreeKb) {
  fail(`three chunk exceeds baseline ${maxThreeKb} KB (${threeChunk.name}: ${threeKb.toFixed(1)} KB)`)
}
pass(`three chunk within baseline (${threeChunk.name}: ${threeKb.toFixed(1)} KB / ${maxThreeKb} KB)`)

const reactVendor = jsFiles.find((item) => item.name.includes('react-vendor'))
if (!reactVendor) fail('react-vendor chunk missing')
pass(`react-vendor chunk present (${(reactVendor.bytes / 1024).toFixed(1)} KB)`)

console.log('Bundle baseline checks passed.')
