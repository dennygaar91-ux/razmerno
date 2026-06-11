import fs from 'node:fs';

const page = fs.readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const store = fs.readFileSync('src/static-pages/constructor/store/constructorStore.ts', 'utf8');
const threeLayer = fs.readFileSync('src/static-pages/constructor/three/ThreeSelectionLayer.tsx', 'utf8');
const css = fs.readFileSync('src/styles/constructor3d.css', 'utf8');

const checks = [
  ['Stage 09 marker exists', page.includes('data-fill-stage="STAGE09"')],
  ['3D target click selects zone', page.includes('selectZone(target.sectionId, target.compartmentId)')],
  ['3D plus opens add menu', threeLayer.includes('onOpenAddMenu?.(payload)') && page.includes('handleThreeAddMenuOpen')],
  ['Fill step asks to select zone on model', page.includes('Выберите зону на 3D-модели')],
  ['Add menu includes shelf action that splits zone', page.includes('onAddShelfToCompartment') && page.includes('Разделит зону на две')],
  ['Add menu includes drawers action for selected zone', page.includes('drawersCount: Math.min')],
  ['Add menu includes rod action for selected zone', page.includes('rodsCount: Math.min')],
  ['Add menu includes clear zone action', page.includes('Убрать наполнение зоны') && page.includes('rzm-3d-add-menu-clear')],
  ['Global filling counters are not main controls', !page.includes('onSetShelvesCount') && !page.includes('onSetDrawersCount') && !page.includes('onSetRodsCount')],
  ['Random preset is real store action', store.includes('applyRandomPresetToSection') && store.includes('drawersCount: index === 0 ? 2 : 0')],
  ['Zone element removal exists', page.includes('onRemoveCompartmentElement') && page.includes('Удалить')],
  ['Stage 09 CSS exists', css.includes('data-fill-stage="STAGE09"')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Stage 09 guard failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}
console.log(`Stage 09 guard passed (${checks.length}/${checks.length}).`);
