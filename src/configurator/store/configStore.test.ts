import assert from "node:assert/strict";
import {
  selectBodyMaterial,
  selectDispatch,
  selectPrice,
  selectValidation,
  useConfigStore,
} from "./configStore";

type TestResult = { name: string; passed: boolean; error?: string };
const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (e) {
    results.push({ name, passed: false, error: e instanceof Error ? e.message : String(e) });
  }
}

test("Zustand foundation: store exposes initial config state", () => {
  useConfigStore.getState().reset();
  const current = useConfigStore.getState();

  assert.equal(current.state.width, 1800);
  assert.equal(current.state.height, 2400);
  assert.equal(typeof selectDispatch(current), "function");
});

test("Zustand foundation: dispatch reuses configReducer", () => {
  useConfigStore.getState().reset();
  useConfigStore.getState().dispatch({ type: "SET_DIM", payload: { dim: "width", value: 2000 } });

  assert.equal(useConfigStore.getState().state.width, 2000);
});

test("Zustand foundation: selectors compute derived data", () => {
  const store = useConfigStore.getState();
  const material = selectBodyMaterial(store);
  const price = selectPrice(store);
  const validation = selectValidation(store);

  assert.ok(material.id);
  assert.ok(price.total > 0);
  assert.ok(Array.isArray(validation));
});

console.log("");
console.log("Zustand foundation tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
