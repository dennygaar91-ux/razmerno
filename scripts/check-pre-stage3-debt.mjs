import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}
function assert(condition, message) {
  if (!condition) {
    console.error(`✗ ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ ${message}`);
  }
}

const app = read('src/App.tsx');
const constructor3d = read('src/static-pages/Constructor3DPage.tsx');
const constructorLegacy = read('src/static-pages/ConstructorPage.tsx');
const draftHook = read('src/static-pages/constructor/hooks/useConstructorDraftLifecycle.ts');

assert(app.includes('staticPage === "constructor" ? LazyConstructor3DPage'), 'primary constructor routes render Constructor3DPage');
assert(app.includes('pathname === "/constructor-legacy"') && app.includes('staticPage === "constructorLegacy" ? LazyConstructorPage'), 'legacy constructor is available only through explicit legacy routes');
assert(!constructor3d.includes('useConstructorDraftLifecycle('), 'active 3D constructor does not start draft autosave lifecycle');
assert(!constructorLegacy.includes('useConstructorDraftLifecycle('), 'legacy constructor page does not start draft autosave lifecycle');
assert(draftHook.includes('must not write configuration snapshots to localStorage') && !draftHook.includes('saveConstructorDraft(') && !draftHook.includes('restoreConstructorDraftToStore('), 'draft lifecycle hook is disabled and does not save/restore drafts');
assert(constructor3d.includes('data-testid="constructor-3d-viewport"'), 'active 3D constructor keeps viewport test id');

if (process.exitCode) process.exit(process.exitCode);
console.log('Pre-Stage 3 technical debt guard passed.');
