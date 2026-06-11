import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(path, "utf8");
}

const page = read("src/static-pages/Constructor3DPage.tsx");
const hook = read("src/static-pages/constructor/hooks/useConstructorPageState.ts");
const css = read("src/styles/constructor3d.css");
const spec = read("tests/browser/configurator3d.spec.ts");
const pkg = read("package.json");

assert.ok(page.includes('data-stage="Q10-Q11"'));
assert.ok(page.includes("rzm-3d-shell--q10-q11"));
assert.ok(page.includes("ResetProjectDialog"));
assert.ok(page.includes("Сбросить параметры"));
assert.ok(page.includes("aria-haspopup=\"dialog\""));
assert.ok(page.includes("role=\"dialog\""));
assert.ok(page.includes("aria-modal=\"true\""));
assert.ok(page.includes("onKeyDown={handleKeyDown}"));
assert.ok(page.includes("event.key === \"Escape\""));
assert.ok(page.includes("event.key === \"Enter\""));
assert.ok(page.includes("resetProject();"));
assert.ok(hook.includes("selectReset"));
assert.ok(hook.includes("resetProject"));
assert.ok(css.includes("Stage Q10/Q11"));
assert.ok(css.includes("rzm-3d-reset-dialog-backdrop"));
assert.ok(css.includes("rzm-ui-btn--danger"));
assert.ok(spec.includes("reset dialog clears the project after confirmation"));
assert.ok(spec.includes("basic WCAG navigation markers"));
assert.ok(pkg.includes("check:stage-q10-q11-reset-wcag"));

console.log("Stage Q10/Q11 reset and WCAG guard passed.");
