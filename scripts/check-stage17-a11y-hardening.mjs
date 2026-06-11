import fs from 'node:fs';
const page = fs.readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const header = fs.readFileSync('src/static-pages/constructor/components/ConstructorHeader.tsx', 'utf8');
const css = fs.readFileSync('src/styles/constructor3d.css', 'utf8');
const required = [
  'data-a11y-stage="STAGE17"',
  'aria-live="polite"',
  'aria-busy=',
  'aria-invalid',
  'aria-describedby',
  'aria-current={isActive ? "step"',
  ':focus-visible'
];
for (const token of required) if (!page.includes(token) && !css.includes(token) && !header.includes(token)) throw new Error(`Stage17 a11y marker missing: ${token}`);
console.log('Stage 17 accessibility guard passed');
