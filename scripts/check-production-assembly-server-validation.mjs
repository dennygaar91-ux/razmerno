import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const source = fs.readFileSync(path.join(root, 'api', 'orders.ts'), 'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }

for (const token of [
  "validateAssembly",
  "assemblyBase",
  "Стоимость сборки рассчитана некорректно",
  "`Сборка: ${formatPrice(p.assembly)}`",
  "Сборка: ${body.assembly?.enabled",
]) {
  if (!source.includes(token)) fail(`orders.ts missing ${token}`)
  else pass(`orders.ts contains ${token}`)
}

if (!ok) process.exit(1)
console.log('Production assembly server validation checks passed.')
