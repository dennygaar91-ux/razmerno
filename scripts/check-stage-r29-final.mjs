import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function read(file) {
  return readFileSync(file, "utf8");
}

const page = read("src/static-pages/ConstructorPage.tsx");
const shared = read("src/static-pages/constructor/components/shared.tsx");
const spec = read("tests/browser/configurator.spec.ts");
const pkg = read("package.json");

assert.ok(page.includes("rzm-stage-r29-e2e-cleanup"), "R29 stage scope class is missing");
assert.ok(shared.includes("aria-label={`Увеличить ${lowerLabel}`}"), "MiniControl plus button needs an accessible label");
assert.ok(shared.includes("aria-label={`Уменьшить ${lowerLabel}`}"), "MiniControl minus button needs an accessible label");
assert.ok(spec.includes("desktop scenario: dimensions, filling, materials and checkout validation"));
assert.ok(spec.includes("checkout options and required fields stay interactive"));
assert.ok(spec.includes('page.getByRole("button", { name: "Увеличить секции" })'));
assert.ok(spec.includes('page.getByLabel("Нужна доставка").check()'));
assert.ok(spec.includes('page.getByLabel(/Согласен на обработку/i).check()'));
assert.ok(!spec.includes("mobile configurator smoke"));
assert.ok(!spec.includes("setViewportSize({ width: 390, height: 844 })"));
assert.ok(!existsSync("src/static-pages/constructor/components/CheckoutNextCard.tsx"), "Unused CheckoutNextCard should be removed");
assert.ok(!existsSync("src/static-pages/constructor/components/CheckoutSummaryCard.tsx"), "Unused CheckoutSummaryCard should be removed");
assert.ok(pkg.includes('"test:desktop-e2e"'));

console.log("Stage R29 final checks passed.");
