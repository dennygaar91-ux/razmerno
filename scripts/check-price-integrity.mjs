import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const seedPath = path.join(root, 'src/pricing/seed/price-items.json')
const jsonlPath = path.join(root, 'db/seed/price-items.jsonl')
const sqlPath = path.join(root, 'db/seed/price-items.sql')

let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function assertFileExists(file) {
  if (!fs.existsSync(file)) fail(`${path.relative(root, file)} is missing`)
}

assertFileExists(seedPath)
assertFileExists(jsonlPath)
assertFileExists(sqlPath)

if (ok) {
  const seed = readJson(seedPath)
  const jsonlRows = fs
    .readFileSync(jsonlPath, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line))
  const sql = fs.readFileSync(sqlPath, 'utf8')

  if (!Array.isArray(seed)) fail('price-items.json must be an array')
  if (seed.length !== jsonlRows.length) fail(`jsonl row count mismatch: ${jsonlRows.length} vs seed ${seed.length}`)
  else pass(`jsonl row count matches seed: ${seed.length}`)

  const required = ['itemType', 'name', 'unit', 'sourcePrice', 'markupMultiplier', 'retailPrice', 'sourceSheet', 'sourceRow']
  for (const [index, item] of seed.entries()) {
    for (const field of required) {
      if (item[field] === undefined || item[field] === null || item[field] === '') {
        fail(`seed[${index}] missing ${field}`)
      }
    }

    if (typeof item.sourcePrice !== 'number' || item.sourcePrice <= 0) fail(`seed[${index}] invalid sourcePrice`)
    if (item.markupMultiplier !== 1.3) fail(`seed[${index}] markupMultiplier must be 1.3`)

    const expectedRetail = Math.round(item.sourcePrice * 1.3 * 100) / 100
    // Excel/Python/JS can differ by 1 kopeck on floating-point halves.
    // For catalog integrity this is acceptable; the source price and multiplier remain auditable.
    if (Math.abs(item.retailPrice - expectedRetail) > 0.011) {
      fail(`seed[${index}] retailPrice mismatch: ${item.retailPrice} vs ${expectedRetail}`)
    }
  }
  pass('seed items have required fields and +30% markup')

  const seen = new Set()
  for (const [index, item] of seed.entries()) {
    const key = [
      item.itemType,
      item.producer ?? '',
      item.article ?? '',
      item.name,
      item.thicknessMm ?? '',
      item.widthMm ?? '',
      item.lengthMm ?? '',
      item.unit,
      item.sourceSheet,
      item.sourceRow,
    ].join('|')

    if (seen.has(key)) fail(`duplicate price item at seed[${index}]: ${key}`)
    seen.add(key)
  }
  pass('no duplicate price item keys')

  const summary = seed.reduce((acc, item) => {
    acc[item.itemType] = (acc[item.itemType] ?? 0) + 1
    return acc
  }, {})

  if ((summary.board ?? 0) < 1000) fail(`expected at least 1000 board items, got ${summary.board ?? 0}`)
  if ((summary.edge ?? 0) < 30) fail(`expected at least 30 edge items, got ${summary.edge ?? 0}`)
  if ((summary.service ?? 0) < 10) fail(`expected at least 10 service items, got ${summary.service ?? 0}`)
  pass(`summary ok: ${JSON.stringify(summary)}`)

  if (!sql.includes('insert into public.price_items')) fail('price-items.sql must insert into public.price_items')
  if (!sql.includes('source_price')) fail('price-items.sql missing source_price column')
  if (!sql.includes('markup_multiplier')) fail('price-items.sql missing markup_multiplier column')
  pass('sql seed has expected structure')

  const normalizedSeedHash = hash(JSON.stringify(seed.map((item) => ({
    itemType: item.itemType,
    name: item.name,
    sourcePrice: item.sourcePrice,
    markupMultiplier: item.markupMultiplier,
    sourceSheet: item.sourceSheet,
    sourceRow: item.sourceRow,
  }))))
  const normalizedJsonlHash = hash(JSON.stringify(jsonlRows.map((item) => ({
    itemType: item.item_type,
    name: item.name,
    sourcePrice: item.source_price,
    markupMultiplier: item.markup_multiplier,
    sourceSheet: item.source_sheet,
    sourceRow: item.source_row,
  }))))

  if (normalizedSeedHash !== normalizedJsonlHash) fail('seed/jsonl normalized hash mismatch')
  else pass('seed/jsonl normalized hash matches')

  if (jsonlRows.some((row) => 'retail_price' in row)) {
    fail('jsonl should not store retail_price because DB calculates it as a generated column')
  } else {
    pass('jsonl does not duplicate generated retail_price')
  }
}

if (!ok) process.exit(1)
console.log('Price integrity checks passed.')
