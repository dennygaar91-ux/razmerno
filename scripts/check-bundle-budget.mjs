import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const distAssets = path.join(root, 'dist', 'assets')
const maxJsKb = Number(process.env.BUNDLE_MAX_JS_KB ?? 800)
const warnJsKb = Number(process.env.BUNDLE_WARN_JS_KB ?? 500)

let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

if (!fs.existsSync(distAssets)) {
  fail('dist/assets is missing. Run npm run build before bundle budget check.')
} else {
  const jsFiles = fs.readdirSync(distAssets)
    .filter((name) => name.endsWith('.js'))
    .map((name) => {
      const full = path.join(distAssets, name)
      return { name, bytes: fs.statSync(full).size }
    })
    .sort((a, b) => b.bytes - a.bytes)

  if (!jsFiles.length) fail('no JS chunks found in dist/assets')

  console.log('Bundle JS chunks:')
  for (const chunk of jsFiles) {
    const kb = chunk.bytes / 1024
    const marker = kb > maxJsKb ? '✗' : kb > warnJsKb ? '!' : '✓'
    console.log(`  ${marker} ${chunk.name}: ${formatKb(chunk.bytes)}`)
    if (kb > maxJsKb) fail(`chunk exceeds hard budget ${maxJsKb} KB: ${chunk.name}`)
  }

  if (ok) pass(`all JS chunks are within hard budget ${maxJsKb} KB`)
}

if (!ok) process.exit(1)
console.log('Bundle budget checks passed.')
