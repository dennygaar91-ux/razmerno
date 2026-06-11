import fs from "node:fs";
import assert from "node:assert/strict";

const read = (path) => fs.readFileSync(path, "utf8");
const page = read("src/static-pages/Constructor3DPage.tsx");
const css = read("src/styles/constructor3d.css");
const pkg = read("package.json");

assert.ok(page.includes('data-stage="Q3"'), "Constructor3DPage must expose Q3 stage marker");
assert.ok(page.includes('rzm-3d-shell--q3'), "Q3 shell marker is required");
assert.ok(page.includes("stepDescriptions"), "Stepper descriptions must be defined");
assert.ok(page.includes("getStepVisualState"), "Stepper visual state helper is required");
assert.ok(page.includes("getStepIssueCount"), "Stepper issue counter is required");
assert.ok(page.includes('role="list"'), "Stepper must expose list semantics");
assert.ok(page.includes('role="listitem"'), "Stepper items must expose listitem semantics");
assert.ok(page.includes('state === "completed"'), "Completed step state must be computed");
assert.ok(page.includes('validationStatus === "warning"'), "Warning step state must be computed");
assert.ok(page.includes('validationStatus === "error"'), "Error step state must be computed");
assert.ok(page.includes('return "future"'), "Future step state must be computed");
assert.ok(page.includes('rzm-3d-price-chip'), "Price must be separated into a dedicated chip");
assert.ok(page.includes('aria-label="Статус сцены и точная стоимость"'), "Stagebar meta needs explicit aria label");

assert.ok(css.includes('Stage Q3'), "Q3 CSS block is required");
assert.ok(css.includes('.rzm-3d-page[data-stage="Q3"] .rzm-3d-stepper'), "Q3 stepper CSS is required");
assert.ok(css.includes('.rzm-3d-page[data-stage="Q3"] .rzm-3d-step.is-active'), "Active step CSS is required");
assert.ok(css.includes('.rzm-3d-page[data-stage="Q3"] .rzm-3d-step.is-completed'), "Completed step CSS is required");
assert.ok(css.includes('.rzm-3d-page[data-stage="Q3"] .rzm-3d-step.is-warning'), "Warning step CSS is required");
assert.ok(css.includes('.rzm-3d-page[data-stage="Q3"] .rzm-3d-step.is-error'), "Error step CSS is required");
assert.ok(css.includes('.rzm-3d-page[data-stage="Q3"] .rzm-3d-price-chip'), "Q3 price chip CSS is required");
assert.ok(pkg.includes('check:stage-q3-stepper-layout'), "package.json must expose Q3 check script");

console.log("Stage Q3 stepper and layout checks passed.");
