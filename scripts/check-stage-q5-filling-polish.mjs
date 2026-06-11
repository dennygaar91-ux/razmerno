import fs from "node:fs";
import assert from "node:assert/strict";

const read = (path) => fs.readFileSync(path, "utf8");
const page = read("src/static-pages/Constructor3DPage.tsx");
const css = read("src/styles/constructor3d.css");
const pkg = read("package.json");

assert.ok(page.includes('data-stage="Q5"'), "Constructor3DPage must expose Q5 stage marker");
assert.ok(page.includes('rzm-3d-shell--q5'), "Q5 shell marker is required");
assert.ok(page.includes('rzm-3d-fill-polish'), "Q5 fill drawer body marker is required");
assert.ok(page.includes('rzm-3d-fill-empty-state'), "Q5 instruction state is required");
assert.ok(page.includes('Выберите зону на 3D-модели'), "Fill step must start with model selection guidance");
assert.ok(page.includes('rzm-q5-current-selection-title'), "Current section/zone block must be accessible");
assert.ok(page.includes('rzm-q5-zone-actions-title'), "Zone actions group must have an accessible title");
assert.ok(page.includes('rzm-q5-zone-summary-title'), "Zone summary counters must have an accessible title");
assert.ok(page.includes('Полки ×'), "Zone counters must show shelf count");
assert.ok(page.includes('Ящики ×'), "Zone counters must show drawer count");
assert.ok(page.includes('Штанга ×'), "Zone counters must show rod count");
assert.ok(page.includes('rzm-q5-validation-title'), "Fill validation group must be separated");
assert.ok(page.includes('В зоне пока нет наполнения'), "Empty zone state must be explicit");
assert.ok(page.includes('aria-pressed={zone.id === activeZoneId}'), "Zone list needs pressed state");
assert.ok(page.includes('selectedZoneIssue'), "Selected zone issue must be shown inline");

assert.ok(css.includes('Stage Q5'), "Q5 CSS block is required");
assert.ok(css.includes('.rzm-3d-page[data-stage="Q5"] .rzm-3d-drawer-body.rzm-3d-fill-polish'), "Q5 drawer scope CSS is required");
assert.ok(css.includes('.rzm-3d-shell--q5 .rzm-3d-fill-empty-state'), "Q5 empty state CSS is required");
assert.ok(css.includes('.rzm-3d-shell--q5 .rzm-3d-fill-counters'), "Q5 counters CSS is required");
assert.ok(css.includes('.rzm-3d-shell--q5 .rzm-3d-add-menu--q5'), "Q5 add menu CSS is required");
assert.ok(pkg.includes('check:stage-q5-filling-polish'), "package.json must expose Q5 check script");

console.log("Stage Q5 filling polish checks passed.");
