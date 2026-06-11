import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const historicalPrefixes = ['BUILD_', 'STAGE_', 'STEP_', 'CHANGES_', 'COPY_', 'DESIGN_', 'DEV_', 'LEGACY_']
const allowedExts = new Set(['.md', '.log'])
let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

const rootFiles = fs.readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)

const offenders = rootFiles.filter((name) => {
  const ext = path.extname(name)
  return allowedExts.has(ext) && historicalPrefixes.some((prefix) => name.startsWith(prefix))
})

if (offenders.length) {
  for (const file of offenders) fail(`historical doc/log remains in project root: ${file}`)
} else {
  pass('no historical stage/build/log docs in project root')
}

const historyPath = path.join(root, 'docs', 'history')
if (!fs.existsSync(historyPath)) {
  fail('docs/history is missing')
} else {
  pass('docs/history exists')
}

if (!ok) process.exit(1)
console.log('Root docs cleanup checks passed.')
