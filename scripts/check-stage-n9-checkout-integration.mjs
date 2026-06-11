import { readFileSync } from 'node:fs';

const page = readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const css = readFileSync('src/styles/constructor3d.css', 'utf8');

const requiredPage = [
  'data-stage="N9"',
  'useConstructorSubmit',
  'function Checkout3DStep',
  'rzm-3d-checkout',
  'Отправить заявку',
  'onContactChange',
  'onConsentChange',
  'quote ? formatPrice(quote.total)',
  'ValidationAssist',
];

const requiredCss = [
  'Stage N9 — checkout integration in 3D shell',
  '.rzm-3d-checkout-card',
  '.rzm-3d-field',
  '.rzm-3d-checkout-submit',
  '.rzm-3d-submit-message',
];

const missing = [];
for (const token of requiredPage) {
  if (!page.includes(token)) missing.push(`Constructor3DPage.tsx: ${token}`);
}
for (const token of requiredCss) {
  if (!css.includes(token)) missing.push(`constructor3d.css: ${token}`);
}

if (missing.length) {
  console.error('Stage N9 checkout integration guard failed:');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Stage N9 checkout integration guard passed.');
