import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const source = fs.readFileSync(path.join(root,'src','configurator','HorizontalStepper.tsx'),'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['stepTitle','data-status','rzm-step-motion','--rzm-error','--rzm-warning','Сначала исправьте ошибки']) {
  if (!source.includes(token)) fail(`Stepper missing ${token}`)
  else pass(`Stepper contains ${token}`)
}
if (source.includes('var(--color-') || source.includes('#d8a73a') || source.includes('#fff6d8')) fail('Stepper must not use legacy semantic colors')
else pass('Stepper legacy semantic colors removed')
if (!ok) process.exit(1)
console.log('Configurator stepper UX checks passed.')
