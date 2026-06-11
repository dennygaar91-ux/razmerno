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

const activePage = read('src/static-pages/Constructor3DPage.tsx');
const lazyViewer = read('src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx');
const boundary = read('src/static-pages/constructor/components/ThreeSceneBoundary.tsx');
const viewer = read('src/static-pages/constructor/three/ThreeFurnitureViewer.tsx');
const webgl = read('src/static-pages/constructor/three/useWebGLAvailable.ts');
const css = read('src/styles/constructor3d.css');
const pkg = JSON.parse(read('package.json'));

assert(activePage.includes('handleThreeRuntimeError'), 'active 3D page handles runtime viewer failures');
assert(activePage.includes('threeFailureReason'), 'active 3D page stores explicit runtime failure reason');
assert(activePage.includes('retryThreeScene'), 'active 3D page exposes retry/reduced 3D recovery path');
assert(activePage.includes('onReady={handleThreeReady}'), 'active 3D page clears failure reason when viewer becomes ready');
assert(!activePage.includes('href="/configurator"'), 'active fallback does not send users back to legacy constructor');
assert(lazyViewer.includes('THREE_VIEWER_LOAD_TIMEOUT_MS'), 'lazy viewer has a load timeout guard');
assert(lazyViewer.includes('three-load-timeout'), 'lazy viewer reports timeout failures');
assert(boundary.includes('resetKey'), 'three boundary can recover after retry/reset key changes');
assert(viewer.includes('ThreeCanvasRuntimeGuard'), 'three viewer installs a runtime canvas guard');
assert(viewer.includes('webglcontextlost'), 'three viewer handles WebGL context loss');
assert(webgl.includes('failIfMajorPerformanceCaveat'), 'WebGL probe uses explicit stable context attributes');
assert(css.includes('rzm-3d-fallback'), 'fallback UI styles are present');
assert(pkg.scripts['check:stage03-three-runtime-stability'], 'package exposes stage 3 guard script');

if (process.exitCode) process.exit(process.exitCode);
console.log('Stage 03 3D runtime stability guard passed.');
