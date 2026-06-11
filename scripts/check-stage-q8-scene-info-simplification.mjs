import { readFileSync } from 'node:fs';

const page = readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const css = readFileSync('src/styles/constructor3d.css', 'utf8');
const pkg = readFileSync('package.json', 'utf8');

const checks = [
  ['page keeps Q8 scene info in current Q9 stage', page.includes('data-stage="Q9"')],
  ['shell marker Q8', page.includes('rzm-3d-shell--q8')],
  ['scene info component', page.includes('function SceneInfoBar')],
  ['scene info helper', page.includes('function getSceneInfo')],
  ['scene info class', page.includes('rzm-3d-scene-info')],
  ['scene info aria live', page.includes('aria-live="polite"')],
  ['css stage Q8 scope', css.includes('Stage Q8') && css.includes('.rzm-3d-scene-info')],
  ['css scene info class', css.includes('.rzm-3d-scene-info')],
  ['package script', pkg.includes('check:stage-q8-scene-info-simplification')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Stage Q8 checks failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}
console.log('Stage Q8 scene info simplification checks passed.');
