import fs from 'node:fs';
const page = fs.readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const css = fs.readFileSync('src/styles/constructor3d.css', 'utf8');
const types = fs.readFileSync('src/static-pages/constructor/types.ts', 'utf8');
const rules = fs.readFileSync('src/static-pages/constructor/rules/projectRules.ts', 'utf8');
const required = [
  'data-validation-stage="STAGE13"',
  'rzm-3d-status-card--valid',
  'rzm-3d-status-card--warning',
  'rzm-3d-status-card--error',
  'blocksCheckout',
  'Исправить автоматически',
  'onAutoFix(primary.id)',
  'aria-live="polite"'
];
for (const token of required) {
  if (!page.includes(token) && !css.includes(token)) throw new Error(`Stage13 validation UX marker missing: ${token}`);
}
if (!types.includes('blocksCheckout: boolean')) throw new Error('Validation issues must keep blocking/non-blocking semantics');
if (!rules.includes('blocksCheckout: false') || !rules.includes('blocksCheckout: true')) throw new Error('Validation rules must include blocking and non-blocking issues');
console.log('Stage 13 validation UX guard passed');
