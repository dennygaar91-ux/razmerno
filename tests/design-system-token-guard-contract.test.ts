import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

type TestFn = () => void;

const tests: Array<{ name: string; run: TestFn }> = [];

function test(name: string, run: TestFn) {
  tests.push({ name, run });
}

const constructorCssDir = join("src", "styles", "constructor3d");
const constructorCss = readdirSync(constructorCssDir)
  .filter((name) => name.endsWith(".css"))
  .map((name) => readFileSync(join(constructorCssDir, name), "utf8"))
  .join("\n");

test("TASK 08-UX-07 constructor3d css uses shared design tokens", () => {
  const tokenRefs = constructorCss.match(/var\(--rzm-[^)]+\)/g) ?? [];
  assert.ok(tokenRefs.length >= 20, `expected >=20 token refs, got ${tokenRefs.length}`);
});

const RAW_HEX_INVENTORY_BASELINE = 175;

test("TASK 08-UX-07 constructor3d raw hex inventory stays bounded", () => {
  const rawHex = constructorCss.match(/#[0-9A-Fa-f]{3,8}\b/g) ?? [];
  assert.ok(
    rawHex.length <= RAW_HEX_INVENTORY_BASELINE,
    `raw hex inventory grew beyond baseline: ${rawHex.length} > ${RAW_HEX_INVENTORY_BASELINE}`,
  );
});

test("TASK 08-UX-07 design-system guard script covers constructor3d inventory", () => {
  const guardSource = readFileSync("scripts/check-design-system-guard.mjs", "utf8");
  assert.match(guardSource, /constructor3d css directory exists/);
  assert.match(guardSource, /raw hex inventory within baseline/);
});

function runTests() {
  for (const item of tests) {
    item.run();
    console.log(`ok - ${item.name}`);
  }
  console.log(`\n${tests.length} passed`);
}

runTests();
