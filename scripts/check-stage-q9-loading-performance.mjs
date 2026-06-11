import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("src/static-pages/Constructor3DPage.tsx", "utf8");
const quoteHook = readFileSync("src/static-pages/constructor/hooks/useConstructorQuote.ts", "utf8");
const css = readFileSync("src/styles/constructor3d.css", "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));

assert.ok(page.includes('data-stage="Q9"'), "Constructor3DPage should expose Q9 stage marker");
assert.ok(page.includes("rzm-3d-shell--q9"), "Constructor shell should include Q9 class");
assert.ok(page.includes("SceneRuntimeStatus"), "Runtime status component should be rendered");
assert.ok(page.includes("Загружаем 3D-модель"), "3D loading copy should be explicit");
assert.ok(page.includes("Упростить модель"), "WebGL fallback should offer reduced model action");
assert.ok(page.includes("aria-busy"), "Scene card should expose busy state");
assert.ok(quoteHook.includes("quoteStatus"), "Quote hook should expose quoteStatus");
assert.ok(quoteHook.includes("setTimeout"), "Quote hook should debounce recalculation");
assert.ok(css.includes("Stage Q9 — 3D loading, recalculation and performance states"), "Q9 CSS layer missing");
assert.ok(css.includes("rzm-3d-loading-skeleton"), "Q9 should include skeleton UI");
assert.ok(pkg.scripts["check:stage-q9-loading-performance"], "Package script missing");

console.log("Stage Q9 loading/performance checks passed.");
