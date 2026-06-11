import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8');
const page = read('src/static-pages/Constructor3DPage.tsx');
const css = read('src/styles/constructor3d.css');
const pkg = read('package.json');

assert.ok(page.includes('data-stage="Q6"'), 'Constructor3DPage must use Q6 stage marker');
assert.ok(page.includes('rzm-3d-shell--q6'), 'Constructor3DPage must use Q6 shell marker');
assert.ok(page.includes('rzm-3d-materials-polish'), 'materials step must use Q6 polish body class');
assert.ok(page.includes('MaterialSelectionSummary'), 'selected materials summary must be rendered');
assert.ok(page.includes('rzm-3d-material-summary'), 'materials summary class must exist in JSX');
assert.ok(page.includes('rzm-3d-material-current'), 'current selected material strip must exist');
assert.ok(page.includes('aria-live="polite"'), 'selected material changes must announce politely');
assert.ok(page.includes('Фильтр материалов фасадов'), 'facade material filters must remain accessible');
assert.ok(page.includes('aria-pressed={facadeKind === kind}'), 'facade filter buttons must expose pressed state');
assert.ok(page.includes('role="list"'), 'material list must expose list semantics');
assert.ok(page.includes('role="listitem"'), 'material options must expose list item semantics');
assert.ok(page.includes('Задняя стенка'), 'back panel read-only material must remain visible');
assert.ok(css.includes('Stage Q6 — materials step polish'), 'Q6 CSS section must exist');
assert.ok(css.includes('position: sticky'), 'material category heading must be sticky');
assert.ok(css.includes('rzm-3d-material-current'), 'selected material strip CSS must exist');
assert.ok(css.includes('rzm-3d-material-summary-item'), 'summary item CSS must exist');
assert.ok(css.includes('box-shadow: inset 0 0 0 2px rgba(255, 114, 76'), 'active material orange ring must exist');
assert.ok(pkg.includes('check:stage-q6-materials-polish'), 'package script must exist');

console.log('Stage Q6 materials polish checks passed.');
