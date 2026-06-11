import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const stepShellPath = path.join(root,'src','configurator','steps','StepShell.tsx')
const legacyPath = path.join(root,'src','configurator','steps.tsx')
const source = fs.existsSync(stepShellPath)
  ? fs.readFileSync(stepShellPath,'utf8')
  : fs.readFileSync(legacyPath,'utf8')
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const token of ['rzm-animate-in','rzm-pressable','border-[var(--rzm-line-soft)]']) {
  if (!source.includes(token)) fail(`StepShell missing ${token}`)
  else pass(`StepShell contains ${token}`)
}
const stepShellStart = source.indexOf('function StepShell')
const stepShellEnd = source.length
const shell = source.slice(stepShellStart, stepShellEnd)
if (shell.includes('var(--color-')) fail('StepShell must not use old color tokens')
else pass('StepShell old color tokens removed')
if (!ok) process.exit(1)
console.log('Configurator StepShell UX checks passed.')
