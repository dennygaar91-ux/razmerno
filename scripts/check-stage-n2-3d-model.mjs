import { readFileSync } from 'node:fs';

const checks = [
  ['src/static-pages/Constructor3DPage.tsx', 'data-stage="N2"'],
  ['src/static-pages/Constructor3DPage.tsx', 'Реалистичный 3D preview'],
  ['src/styles/constructor3d.css', 'Stage N2: stronger realistic 3D product preview foundation'],
  ['src/static-pages/constructor/three/threeTypes.ts', '"hinge"'],
  ['src/static-pages/constructor/three/threeTypes.ts', 'rotation?: [number, number, number]'],
  ['src/static-pages/constructor/three/threeSceneAdapter.ts', 'addDoorHardware'],
  ['src/static-pages/constructor/three/threeSceneAdapter.ts', 'addDrawer'],
  ['src/static-pages/constructor/three/threeSceneAdapter.ts', 'addRod'],
  ['src/static-pages/constructor/three/ThreeFurniturePanels.tsx', 'CylindricalPanel'],
  ['src/static-pages/constructor/three/threeSceneAdapter.test.ts', 'three adapter N2'],
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

console.log('Stage N2 3D model guard passed.');
