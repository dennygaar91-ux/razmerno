import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const runtimeDirs = ['src', 'api']
const ignoredParts = new Set(['node_modules', 'dist', 'docs'])
const deprecatedModules = [
  'src/constructor/api.ts',
  'src/constructor/legacyGeometry.ts',
  'src/constructor/payload.ts',
  'src/constructor/basisAdapter.ts',
  'src/constructor/pricing.ts',
  'src/constructor/productionModel.ts',
  'src/constructor/quickEstimate.ts',
  'src/constructor/rules.ts',
  'src/constructor/basis/manualExport.ts',
  'src/constructor/drillingTemplates.ts',
]

let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    const relParts = path.relative(root, full).split(path.sep)
    if (relParts.some((part) => ignoredParts.has(part))) continue
    if (entry.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const files = runtimeDirs
  .map((dir) => path.join(root, dir))
  .filter((dir) => fs.existsSync(dir))
  .flatMap(walk)
  .filter((file) => ['.ts', '.tsx', '.js', '.mjs'].includes(path.extname(file)))

const offenders = []

for (const file of files) {
  const rel = path.relative(root, file)
  const source = fs.readFileSync(file, 'utf8')
  for (const modulePath of deprecatedModules) {
    if (deprecatedModules.includes(rel)) continue

    const base = path.basename(modulePath, '.ts')
    const importPattern = new RegExp(`from\\s+["'][^"']*${base}["']|import\\(["'][^"']*${base}["']\\)`)
    if (importPattern.test(source)) {
      offenders.push(`${rel} imports deprecated ${modulePath}`)
    }
  }
}

if (offenders.length) {
  for (const offender of offenders) fail(offender)
} else {
  pass('runtime code does not import deprecated constructor modules')
}

if (!ok) process.exit(1)
console.log('Legacy runtime import checks passed.')
