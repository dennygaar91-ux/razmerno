import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok = false }
function pass(m){ console.log(`✓ ${m}`) }
const source = fs.readFileSync(path.join(root, 'src/configurator/store/configStore.ts'), 'utf8')

for (const token of ['../state/initialConfigState', '../state/configReducer', 'initialConfigState']) {
  if (!source.includes(token)) fail(`configStore missing ${token}`)
  else pass(`configStore contains ${token}`)
}

if (source.includes('from "../context"')) fail('configStore still imports from context')
else pass('configStore no longer imports from context')

if (!ok) process.exit(1)
console.log('Stage 27 store state facade checks passed.')
