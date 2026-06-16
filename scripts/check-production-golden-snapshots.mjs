import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const requiredFiles = [
  'tests/fixtures/production-golden-cases.ts',
  'tests/production/production-golden-snapshots.test.ts',
  'docs/production/production-golden-snapshots-v1.md',
]

const failures = []

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8')
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(ROOT, file))) {
    failures.push(`Missing required production golden snapshots file: ${file}`)
  }
}

const fixturePath = 'tests/fixtures/production-golden-cases.ts'
const testPath = 'tests/production/production-golden-snapshots.test.ts'
const packagePath = 'package.json'
const workflowPath = '.github/workflows/qa.yml'

if (fs.existsSync(path.join(ROOT, fixturePath))) {
  const fixture = read(fixturePath)
  const caseCount = (fixture.match(/id: '/g) || []).length
  if (caseCount < 4) failures.push(`Expected at least 4 production golden cases, found ${caseCount}`)
  for (const expectedCase of [
    'basic-wardrobe',
    'wardrobe-with-shelves',
    'wardrobe-with-drawers-and-rod',
    'wardrobe-with-production-warnings',
  ]) {
    if (!fixture.includes(expectedCase)) failures.push(`Missing golden case: ${expectedCase}`)
  }
}

if (fs.existsSync(path.join(ROOT, testPath))) {
  const test = read(testPath)
  for (const required of [
    'buildProductionModel',
    'normalizeProductionSnapshot',
    'assertNoVolatileFields',
    'productionGoldenCases',
    'generatedAt',
    'orderId',
    'createdAt',
    'updatedAt',
    'requiresTechnologistCheck',
    'basisExportPlan',
  ]) {
    if (!test.includes(required)) failures.push(`Production golden snapshot test missing required token: ${required}`)
  }
  if (test.includes('const fake') || test.includes('hardcoded fake')) {
    failures.push('Production golden snapshot test must not use fake hardcoded production JSON')
  }
  if (!test.includes('assert.deepEqual(first, second')) {
    failures.push('Production golden snapshot test must assert deterministic repeated output')
  }
}

if (fs.existsSync(path.join(ROOT, packagePath))) {
  const pkg = JSON.parse(read(packagePath))
  const scripts = pkg.scripts || {}
  if (scripts['check:production-golden-snapshots'] !== 'node scripts/check-production-golden-snapshots.mjs') {
    failures.push('package.json missing check:production-golden-snapshots script')
  }
  if (scripts['test:production-golden-snapshots'] !== 'node --no-warnings --import tsx tests/production/production-golden-snapshots.test.ts') {
    failures.push('package.json missing test:production-golden-snapshots script')
  }
}

if (fs.existsSync(path.join(ROOT, workflowPath))) {
  const workflow = read(workflowPath)
  for (const required of [
    'Production golden snapshots guard',
    'Production golden snapshots tests',
    'npm run check:production-golden-snapshots',
    'npm run test:production-golden-snapshots',
  ]) {
    if (!workflow.includes(required)) failures.push(`QA workflow missing required production golden snapshots step/token: ${required}`)
  }
}

if (failures.length > 0) {
  console.error('Production golden snapshots guard failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Production golden snapshots guard passed')
