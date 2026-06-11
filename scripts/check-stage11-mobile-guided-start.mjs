import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }
const quick = read('src/configurator/QuickStart.tsx')
for (const token of ['USE_CASES','Сначала выберите задачу','quickstart_use_case_selected','Прихожая','Спальня']) {
  if (!quick.includes(token)) fail(`QuickStart missing ${token}`)
  else pass(`QuickStart contains ${token}`)
}
const mobile = read('src/configurator/MobileBottomBar.tsx')
for (const token of ['stepProgress','Шаг {state.activeStep + 1}/{STEPS.length}','currentStep','профи']) {
  if (!mobile.includes(token)) fail(`MobileBottomBar missing ${token}`)
  else pass(`MobileBottomBar contains ${token}`)
}
if (!ok) process.exit(1)
console.log('Stage 11 mobile guided start checks passed.')
