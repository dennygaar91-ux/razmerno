import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
function assert(condition, message) {
  if (!condition) {
    console.error(`✗ ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ ${message}`);
  }
}

const page = read('src/static-pages/Constructor3DPage.tsx');
const blueprint = read('src/static-pages/constructor/components/ConstructorRealisticSvgModel.tsx');
const css = read('src/styles/constructor3d.css');
const pkg = JSON.parse(read('package.json'));

assert(page.includes('sceneRenderMode'), 'active constructor has an explicit scene render mode');
assert(page.includes('setSceneRenderMode("blueprint")'), '2D fallback can be opened manually');
assert(page.includes('TwoDFallbackScene'), 'active constructor renders a working 2D fallback scene');
assert(page.includes('ConstructorRealisticSvgModel'), '2D fallback uses the blueprint SVG model');
assert(page.includes('getModelMetrics(width, height, depth)'), '2D fallback uses current dimensions for model metrics');
assert(page.includes('input={threeInput}'), '2D fallback receives the same constructor state as 3D');
assert(page.includes('validation={validation}'), '2D fallback receives validation state');
assert(page.includes('onUseReducedModel') && page.includes('onRetry3D'), '2D fallback keeps 3D recovery actions available');
assert(page.includes('2D fallback работает'), 'runtime status communicates active 2D fallback');
assert(blueprint.includes('rzm-blueprint-svg') && blueprint.includes('rzm-blueprint-dimensions'), 'blueprint renderer exposes technical drawing primitives and dimensions');
assert(blueprint.includes('selectedCompartmentId') && blueprint.includes('rzm-blueprint-active-area'), 'blueprint renderer highlights selected zones');
assert(!page.includes('function ThreeFallback('), 'old message-only ThreeFallback is removed from active page');
assert(css.includes('rzm-3d-blueprint-fallback'), '2D fallback layout styles are present');
assert(css.includes('rzm-3d-render-switch'), 'manual 3D/2D switch styles are present');
assert(pkg.scripts['check:stage04-2d-fallback'], 'package exposes stage 4 guard script');

if (process.exitCode) process.exit(process.exitCode);
console.log('Stage 04 2D fallback guard passed.');
