import fs from 'node:fs';

const page = fs.readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const store = fs.readFileSync('src/static-pages/constructor/store/constructorStore.ts', 'utf8');
const selectors = fs.readFileSync('src/static-pages/constructor/store/constructorSelectors.ts', 'utf8');
const canonical = fs.readFileSync('src/static-pages/constructor/store/constructorCanonicalState.ts', 'utf8');
const pageState = fs.readFileSync('src/static-pages/constructor/hooks/useConstructorPageState.ts', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const checks = [
  ['Stage 07 architecture marker is present without breaking Stage 06 CSS scope', page.includes('data-state-layer="STAGE07"') && page.includes('data-stage="STAGE06"')],
  ['canonical state builder exists', canonical.includes('buildCanonicalConstructorState') && canonical.includes('ConstructorCanonicalState')],
  ['canonical state includes furniture, dimensions, sections and materials', canonical.includes('furnitureType') && canonical.includes('dimensions') && canonical.includes('sections') && canonical.includes('materials')],
  ['canonical state has selected zone alias', canonical.includes('selectedZoneId') && canonical.includes('selection')],
  ['canonical state has exactModeEnabled', canonical.includes('exactModeEnabled')],
  ['store exposes selectedZoneId alias', store.includes('selectedZoneId: string | null') && store.includes('selectZone: (sectionId: string, zoneId: string) => void')],
  ['store exposes global exact mode', store.includes('exactModeEnabled: boolean') && store.includes('setExactModeEnabled')],
  ['legacy advanced setters now sync global exact mode', store.includes('advancedSizes: advancedFill') && store.includes('advancedFill: advancedSizes')],
  ['selectors expose canonical constructor state', selectors.includes('selectCanonicalConstructorState') && selectors.includes('buildCanonicalConstructorState')],
  ['page state exposes canonical state and exact mode action', pageState.includes('canonicalState') && pageState.includes('setExactModeEnabled')],
  ['active 3D page builds viewer input from canonical state', page.includes('canonicalState.furnitureType') && page.includes('canonicalState.selectedZoneId')],
  ['3D selection uses zone alias action', page.includes('selectZone(target.sectionId, target.compartmentId)')],
  ['Stage 07 test script registered', pkg.scripts?.['test:constructor-canonical-state'] === 'node --no-warnings --import tsx src/static-pages/constructor/store/constructorCanonicalState.test.ts'],
  ['Stage 07 guard registered', pkg.scripts?.['check:stage07-canonical-state'] === 'node scripts/check-stage07-canonical-state.mjs'],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Stage 07 canonical state check failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`Stage 07 canonical state check passed (${checks.length}/${checks.length}).`);
