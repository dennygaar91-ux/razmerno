import { readFileSync } from 'node:fs';

const page = readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const css = readFileSync('src/styles/constructor3d.css', 'utf8');
const pkg = readFileSync('package.json', 'utf8');

const checks = [
  ['page stage marker Q8.1', page.includes('data-stage="Q8.1"')],
  ['shell marker Q8.1', page.includes('rzm-3d-shell--q8-1')],
  ['cumulative scope comment', css.includes('Stage Q8.1 — cumulative visual scope repair')],
  ['no Q7 shell selector remains', !css.includes('.rzm-3d-shell--q7')],
  ['no Q7 page-stage material selector remains', !css.includes('data-stage="Q7"')],
  ['materials polish is component-scoped', css.includes('.rzm-3d-drawer-body.rzm-3d-materials-polish')],
  ['checkout polish is component-scoped', css.includes('.rzm-3d-shell .rzm-3d-checkout--q7')],
  ['scene info is stable-scoped', css.includes('.rzm-3d-shell .rzm-3d-scene-card')],
  ['package script', pkg.includes('check:stage-q8-1-css-scope-repair')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Stage Q8.1 CSS scope repair checks failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log('Stage Q8.1 CSS scope repair checks passed.');
