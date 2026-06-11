import fs from 'node:fs';

const required = [
  ['src/static-pages/Constructor3DPage.tsx', 'data-stage="N5"'],
  ['src/static-pages/Constructor3DPage.tsx', 'zoneFacadeLayout'],
  ['src/static-pages/Constructor3DPage.tsx', 'Фасад зоны'],
  ['src/static-pages/constructor/types.ts', 'ConstructorZoneFacadeLayout'],
  ['src/static-pages/constructor/rules/projectRules.ts', 'normalizeZoneFacadeLayout'],
  ['src/static-pages/constructor/store/constructorStore.ts', 'setZoneFacadeMode'],
  ['src/static-pages/constructor/three/threeSceneAdapter.ts', 'addFacadeForZone'],
  ['src/static-pages/constructor/three/threeSceneAdapter.test.ts', 'three adapter N5'],
  ['src/styles/constructor3d.css', 'Stage N5'],
];

const missing = required.filter(([file, marker]) => !fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(marker));
if (missing.length) {
  console.error('Stage N5 check failed:');
  for (const [file, marker] of missing) console.error(`- ${file}: missing ${marker}`);
  process.exit(1);
}
console.log('Stage N5 zone facades check passed');
