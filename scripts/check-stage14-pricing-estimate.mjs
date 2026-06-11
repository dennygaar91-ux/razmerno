import fs from 'node:fs';
const page = fs.readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const policy = fs.readFileSync('src/pricing/pricingPolicy.ts', 'utf8');
const engine = fs.readFileSync('src/pricing/engine.ts', 'utf8');
const required = [
  'data-pricing-stage="STAGE14"',
  'Точная стоимость',
  'Материалы',
  'Фурнитура',
  'Работы',
  'Доставка / сборка',
  'Стоимость рассчитана по текущей конфигурации'
];
for (const token of required) if (!page.includes(token)) throw new Error(`Stage14 pricing marker missing: ${token}`);
if (!policy.includes('CLIENT_PRICE_MULTIPLIER') || !policy.includes('1.3')) throw new Error('Client price multiplier 1.3 is not explicit');
if (page.includes('предварительно') || page.includes('примерно') || page.includes('ориентировочно')) throw new Error('Constructor must not weaken exact price wording');
if (!engine.includes('CLIENT_PRICE_MULTIPLIER')) throw new Error('Pricing engine must use client price multiplier policy');
console.log('Stage 14 pricing guard passed');
