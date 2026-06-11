import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");
const page = read("src/static-pages/Constructor3DPage.tsx");
const css = read("src/styles/constructor3d.css");
const pkg = read("package.json");

assert.ok(page.includes('data-stage="Q1"'), "Constructor3DPage must use Q1 stage marker");
assert.ok(page.includes('rzm-3d-shell--q1'), "Q1 shell marker is required");
assert.ok(page.includes('rzm-ui-btn--primary'), "Q1 must introduce primary button class");
assert.ok(page.includes('rzm-ui-btn--secondary'), "Q1 must introduce secondary button class");
assert.ok(page.includes('aria-describedby="rzm-3d-primary-action-help"'), "Primary CTA must describe disabled/help reason");
assert.ok(page.includes('Вращайте модель мышкой'), "3D scene legend is required");
assert.ok(page.includes('required'), "Required checkout fields must be explicit");
assert.ok(page.includes('aria-describedby={describedBy}'), "Fields must support aria-describedby");
assert.ok(page.includes('const controlId = useId()'), "NumberControl must generate stable ids");
assert.ok(page.includes('role="group"'), "NumberControl must be grouped semantically");
assert.ok(page.includes('aria-labelledby={labelId}'), "NumberControl must have aria-labelledby");
assert.ok(page.includes('aria-label={`Уменьшить ${lowerLabel}`}'), "Decrease button must have aria-label");
assert.ok(page.includes('aria-label={`Увеличить ${lowerLabel}`}'), "Increase button must have aria-label");
assert.ok(page.includes('disabled={!canDecrease}'), "Decrease button must disable at min");
assert.ok(page.includes('disabled={!canIncrease}'), "Increase button must disable at max");
assert.ok(page.includes('aria-pressed={sceneViewMode === mode}'), "Camera buttons must expose pressed state");
assert.ok(page.includes('aria-pressed={furniture === item.key}'), "Furniture type buttons must expose pressed state");

assert.ok(css.includes('Stage Q1'), "Q1 CSS section is required");
assert.ok(css.includes('--rzm-ui-primary: #ff724c'), "Q1 must define primary token");
assert.ok(css.includes('.rzm-ui-btn--primary'), "Q1 primary button CSS required");
assert.ok(css.includes(':focus-visible'), "Visible focus styles required");
assert.ok(css.includes('min-width: 44px'), "Icon hit-zone must be at least 44px");
assert.ok(css.includes('.rzm-3d-scene-legend'), "Scene legend CSS required");

assert.ok(pkg.includes('check:stage-q1-accessibility-foundation'), "Package script for Q1 check required");
console.log('Stage Q1 accessibility foundation checks passed.');
