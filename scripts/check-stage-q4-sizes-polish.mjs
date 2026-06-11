import fs from "node:fs";
import assert from "node:assert/strict";

const read = (path) => fs.readFileSync(path, "utf8");
const page = read("src/static-pages/Constructor3DPage.tsx");
const css = read("src/styles/constructor3d.css");
const pkg = read("package.json");

assert.ok(page.includes('data-stage="Q4"'), "Constructor3DPage must expose Q4 stage marker");
assert.ok(page.includes('rzm-3d-shell--q4'), "Q4 shell marker is required");
assert.ok(page.includes('SectionWidthSummary'), "Q4 needs a dedicated section width summary component");
assert.ok(page.includes('rzm-3d-size-block'), "Q4 needs separated size blocks");
assert.ok(page.includes('rzm-q4-total-size-title'), "Q4 total dimensions block needs an accessible title");
assert.ok(page.includes('rzm-q4-sections-title'), "Q4 section widths block needs an accessible title");
assert.ok(page.includes('Выровнять секции'), "Equalize action should use explicit copy");
assert.ok(page.includes('Распределить секции равномерно'), "Equalize action needs a tooltip/title");
assert.ok(page.includes('Сумма ширин секций'), "Section width formula note must be accessible");
assert.ok(page.includes('Минимальная ширина секции'), "Section minimum width must be visible before errors");
assert.ok(page.includes('canIncreaseOverride'), "Section +/- must support disabled state before invalid values");
assert.ok(page.includes('increaseDisabledTitle'), "Disabled increment should explain the reason");
assert.ok(page.includes('Точная ширина секций'), "Advanced section width editing must be explicit");
assert.ok(page.includes('onSectionWidthChange'), "Manual section width changes must remain wired");
assert.ok(page.includes('onEqualizeSections'), "Equalize sections action must remain wired");

assert.ok(css.includes('Stage Q4'), "Q4 CSS block is required");
assert.ok(css.includes('.rzm-3d-page[data-stage="Q4"] .rzm-3d-size-block'), "Q4 size block CSS is required");
assert.ok(css.includes('.rzm-3d-page[data-stage="Q4"] .rzm-3d-section-formula'), "Q4 section formula CSS is required");
assert.ok(css.includes('.rzm-3d-page[data-stage="Q4"] .rzm-3d-section-width-list'), "Q4 section width list CSS is required");
assert.ok(css.includes('.rzm-3d-page[data-stage="Q4"] .rzm-3d-control-row.is-compact'), "Q4 compact numeric control CSS is required");
assert.ok(pkg.includes('check:stage-q4-sizes-polish'), "package.json must expose Q4 check script");

console.log("Stage Q4 sizes polish checks passed.");
