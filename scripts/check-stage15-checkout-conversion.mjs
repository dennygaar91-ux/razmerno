import fs from 'node:fs';
const page = fs.readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const submit = fs.readFileSync('src/static-pages/constructor/hooks/useConstructorSubmit.ts', 'utf8');
const order = fs.readFileSync('src/shared/lib/order.ts', 'utf8');
const required = [
  'data-checkout-stage="STAGE15"',
  'Имя',
  'Телефон',
  'Email',
  'Нужна доставка',
  'Адрес доставки',
  'Нужна сборка',
  'Смета',
  'Повтор через',
  'RESUBMIT_COOLDOWN_MS = 30_000'
];
for (const token of required) if (!page.includes(token) && !submit.includes(token)) throw new Error(`Stage15 checkout marker missing: ${token}`);
if (!order.includes('Email указан с ошибкой') || !order.includes('российский номер')) throw new Error('Customer validation must require email and RU phone');
console.log('Stage 15 checkout guard passed');
