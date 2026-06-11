import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const mini = read('src/configurator/steps/MiniCounter.tsx')
if (!mini.includes('export function MiniCounter')) fail('MiniCounter export missing')
else pass('MiniCounter export exists')

const filling = read('src/configurator/steps/FillingStep.tsx')
if (!filling.includes('import { MiniCounter } from "./MiniCounter";')) fail('FillingStep missing MiniCounter import')
else pass('FillingStep imports MiniCounter')
if (filling.includes('function MiniCounter')) fail('FillingStep still defines MiniCounter')
else pass('FillingStep no longer defines MiniCounter')

if (!ok) process.exit(1)
console.log('Stage 22 MiniCounter extraction checks passed.')
