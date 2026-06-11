import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

const checks = [
  ['src/components/HeroReworked.tsx', ['как Lego', 'HeroCabinetVisual', 'rzm-card-dark', '/configurator?']],
  ['src/components/FearsReworked.tsx', ['Система ведёт за руку', 'Новичку', 'Опытному', 'backend']],
  ['src/components/ProcessReworked.tsx', ['Задаёте размер', 'Собираете модули', 'Видите цену', 'Отправляете заявку']],
  ['src/components/Support.tsx', ['набор деталей', 'Смета в письме', 'цель MVP — заявка']],
  ['src/components/ProjectsReworked.tsx', ['Стартовые наборы', 'Открыть в конструкторе', 'MiniCabinet']],
  ['src/components/Faq.tsx', ['6 000 ₽', '50 ₽', '10%', 'fallback']],
  ['src/components/Footer.tsx', ['Перейти в конструктор', '@razmerno_meb', 'MVP-режиме']],
  ['src/components/HeaderReworked.tsx', ['Как устроено', 'Наборы', '--rzm-text-main']],
  ['src/Landing.tsx', ['HeroReworked', 'FearsReworked', 'ProcessReworked', 'Support', 'ProjectsReworked', 'Faq', 'Footer']],
  ['src/components/SeoStructuredData.tsx', ['replace(/</g', 'точная цена']],
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
  'check:landing-hero',
  'check:landing-system',
  'check:landing-process',
  'check:landing-assembly',
  'check:landing-starter-kits',
  'check:landing-faq',
  'check:landing-footer',
  'check:landing-header',
  'check:landing-structure-seo',
]) {
  if (!pkg.scripts?.[script]) fail(`missing package script ${script}`)
  else pass(`package script exists ${script}`)
}

if (!ok) process.exit(1)
console.log('Stage 1.2 landing redesign checks passed.')
