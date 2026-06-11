import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
function read(rel){ return fs.readFileSync(path.join(root, rel), 'utf8') }

const checks = [
  ['src/configurator/QuickStart.tsx', ['Шаг 0 · быстрый старт','поведёт по шагам','quickstart_redesign']],
  ['src/configurator/HorizontalStepper.tsx', ['stepTitle','data-status','--rzm-error','--rzm-warning']],
  ['src/configurator/steps/ReviewStep.tsx', ['Проверьте заявку','Стоимость шкафа без доставки и сборки','МКАД 6 000 ₽','Открыть заявку']],
  ['src/configurator/MobileBottomBar.tsx', ['Стоимость шкафа','Открыть заявку','Исправить']],
  ['src/configurator/CheckoutDrawer.tsx', ['Финальный шаг','Оставьте контакты для проверки']],
  ['src/configurator/checkout/CheckoutOrderSummary.tsx', ['Собранный комплект']],
  ['src/configurator/checkout/CheckoutSubmitBlock.tsx', ['Отправить и получить смету']],
]

for (const [rel, tokens] of checks) {
  const source = read(rel)
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}

const pkg = JSON.parse(read('package.json'))
for (const script of [
  'check:configurator-quickstart-ux',
  'check:configurator-stepper-ux',
  'check:configurator-step-shell-ux',
  'check:configurator-dimensions-ux',
  'check:configurator-filling-ux',
  'check:configurator-materials-ux',
  'check:configurator-review-ux',
  'check:configurator-mobile-bar-ux',
  'check:configurator-checkout-ux',
]) {
  if (!pkg.scripts?.[script]) fail(`missing package script ${script}`)
  else pass(`package script exists ${script}`)
}

if (!ok) process.exit(1)
console.log('Stage 1.3 configurator UX checks passed.')
