import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const requiredFiles = [
  'src/constructor/productionModel.ts',
  'src/constructor/productionModelMath.ts',
  'src/constructor/productionModelEdges.ts',
  'src/constructor/productionModelPanels.ts',
  'src/constructor/productionModelDrilling.ts',
  'src/constructor/productionModelTotals.ts',
  'src/constructor/productionModelBasis.ts',
  'src/constructor/geometry/buildHardware.ts',
  'src/constructor/geometry/buildHardwareHelpers.ts',
  'docs/infrastructure-production-geometry-pass.md',
]

const missing = requiredFiles.filter(file => !fs.existsSync(path.join(root, file)))
if (missing.length > 0) {
  console.error('[production-geometry-architecture] Missing files:')
  for (const file of missing) console.error(`- ${file}`)
  process.exit(1)
}

function lineCount(file) {
  return fs.readFileSync(path.join(root, file), 'utf8').split('\n').length
}

const limits = [
  ['src/constructor/productionModel.ts', 450],
  ['src/constructor/geometry/buildHardware.ts', 460],
  ['src/constructor/productionModelDrilling.ts', 180],
]

const failures = limits.filter(([file, limit]) => lineCount(file) > limit)
if (failures.length > 0) {
  console.error('[production-geometry-architecture] File line limit exceeded:')
  for (const [file, limit] of failures) {
    console.error(`- ${file}: ${lineCount(file)} lines > ${limit}`)
  }
  process.exit(1)
}

const productionModel = fs.readFileSync(path.join(root, 'src/constructor/productionModel.ts'), 'utf8')
const expectedImports = [
  './productionModelEdges',
  './productionModelPanels',
  './productionModelDrilling',
  './productionModelTotals',
  './productionModelBasis',
]
const missingImports = expectedImports.filter(importPath => !productionModel.includes(importPath))
if (missingImports.length > 0) {
  console.error('[production-geometry-architecture] productionModel.ts does not use expected helper modules:')
  for (const importPath of missingImports) console.error(`- ${importPath}`)
  process.exit(1)
}

const buildHardware = fs.readFileSync(path.join(root, 'src/constructor/geometry/buildHardware.ts'), 'utf8')
if (!buildHardware.includes('./buildHardwareHelpers')) {
  console.error('[production-geometry-architecture] buildHardware.ts must import buildHardwareHelpers')
  process.exit(1)
}

console.log('[production-geometry-architecture] OK')
