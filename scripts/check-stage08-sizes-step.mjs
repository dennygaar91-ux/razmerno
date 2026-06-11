import fs from 'node:fs';

const page = fs.readFileSync('src/static-pages/Constructor3DPage.tsx', 'utf8');
const css = fs.readFileSync('src/styles/constructor3d.css', 'utf8');
const store = fs.readFileSync('src/static-pages/constructor/store/constructorStore.ts', 'utf8');
const canonicalTest = fs.readFileSync('src/static-pages/constructor/store/constructorCanonicalState.test.ts', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const checks = [
  ['Stage 08 marker is present without breaking previous stage marker', page.includes('data-size-stage="STAGE08"') && page.includes('data-stage="STAGE06"')],
  ['sizes step imports furniture-specific dimension limits', page.includes('CONSTRUCTOR_DIMENSION_LIMITS') && page.includes('dimensionLimits.minWidthMm')],
  ['furniture type is inside sizes step with all MVP product types', page.includes('rzm-stage08-furniture-type-title') && page.includes('furnitureOptions.map') && page.includes('Что собираем')],
  ['dimension controls use furniture-specific min/max values', page.includes('min={dimensionLimits.minWidthMm}') && page.includes('max={dimensionLimits.maxHeightMm}') && page.includes('max={dimensionLimits.maxDepthMm}')],
  ['dimension controls expose direct numeric input', page.includes('rzm-3d-number-input') && page.includes('inputMode="numeric"')],
  ['dimension controls provide inline auto-fix hook', page.includes('onAutoFix={() => onApplyAutoFixForIssue(sizeIssues.width?.id)}') && page.includes('rzm-3d-inline-fix')],
  ['section count respects 200mm minimum through shared rules', page.includes('CONSTRUCTOR_SECTION_RULES.minWidthMm') && page.includes('canIncreaseOverride={canAddSection}')],
  ['sizes step keeps exact-size toggle global', page.includes('onAdvancedSizesChange={onAdvancedSizesChange}') && store.includes('setExactModeEnabled')],
  ['canonical test covers furniture defaults and section width constraints', canonicalTest.includes('size step: furniture defaults update canonical dimensions') && canonicalTest.includes('size step: section count is clamped by minimum section width')],
  ['Stage 08 CSS scope exists', css.includes('Stage 08 — sizes step product logic') && css.includes('[data-size-stage="STAGE08"]')],
  ['Stage 08 script registered', pkg.scripts?.['check:stage08-sizes-step'] === 'node scripts/check-stage08-sizes-step.mjs'],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Stage 08 sizes-step check failed:');
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`Stage 08 sizes-step check passed (${checks.length}/${checks.length}).`);
