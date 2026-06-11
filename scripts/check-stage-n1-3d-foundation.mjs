import { readFileSync } from 'node:fs';

const checks = [
  ['src/static-pages/Constructor3DPage.tsx', 'export default function Constructor3DPage'],
  ['src/static-pages/Constructor3DPage.tsx', 'rzm-3d-shell'],
  ['src/static-pages/Constructor3DPage.tsx', 'LazyThreeFurnitureViewer'],
  ['src/static-pages/Constructor3DPage.tsx', 'Рандомно'],
  ['src/static-pages/Constructor3DPage.tsx', 'Открыть legacy-конструктор'],
  ['src/styles/constructor3d.css', '.rzm-3d-workspace'],
  ['src/styles/constructor3d.css', '.rzm-3d-drawer'],
  ['src/App.tsx', 'configurator-3d'],
  ['src/main.tsx', './styles/constructor3d.css'],
];

const errors = [];
for (const [file, marker] of checks) {
  const source = readFileSync(file, 'utf8');
  if (!source.includes(marker)) errors.push(`${file}: missing ${marker}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Stage N1 3D foundation guard passed.');
