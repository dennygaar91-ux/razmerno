import fs from 'node:fs';

const page = fs.readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const store = fs.readFileSync('src/static-pages/constructor/store/constructorStore.ts', 'utf8');
const hook = fs.readFileSync('src/static-pages/constructor/hooks/useConstructorPageState.ts', 'utf8');
const canonicalTest = fs.readFileSync('src/static-pages/constructor/store/constructorCanonicalState.test.ts', 'utf8');
const css = fs.readFileSync('src/styles/constructor3d.css', 'utf8');

const checks = [
  ['Stage 10 marker exists', page.includes('data-facade-stage="STAGE10"')],
  ['Section-level facade controls exist in normal mode', page.includes('Фасады включены') && page.includes('Открытая секция')],
  ['Zone-level facade override is gated by advancedFill', page.includes('advancedFill && activeZoneId') && page.includes('Фасад зоны')],
  ['Exact mode setter is global for fill and sizes', page.includes('onAdvancedFillChange={setExactModeEnabled}') && store.includes('setExactModeEnabled: (exactModeEnabled)')],
  ['Zone facade modes persist in store', store.includes('setZoneFacadeMode') && store.includes('zoneFacadeLayout')],
  ['Handleless control is wired to active page state', page.includes('onHandlelessChange={setHandleless}') && hook.includes('setHandleless')],
  ['Handle controls are disabled when section is open', page.includes('disabled={facadeMode === "open"}')],
  ['Facade/handle CSS exists', css.includes('data-facade-stage="STAGE10"') && css.includes('rzm-3d-handle-control')],
  ['Store test covers zone facade exact mode', canonicalTest.includes('exact mode enables zone-level facade override')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Stage 10 guard failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}
console.log(`Stage 10 guard passed (${checks.length}/${checks.length}).`);
