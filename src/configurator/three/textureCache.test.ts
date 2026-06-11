import assert from "node:assert/strict";
import fs from "node:fs";

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

const materialsSource = fs.readFileSync("src/configurator/three/materials.ts", "utf8");
const panelSource = fs.readFileSync("src/configurator/three/PanelMesh.tsx", "utf8");

test("Texture cache: materials exposes cache helpers", () => {
  assert.ok(materialsSource.includes("const textureCache = new Map"));
  assert.ok(materialsSource.includes("getProceduralTexture"));
  assert.ok(materialsSource.includes("disposeProceduralTextureCache"));
});

test("Texture cache: PanelMesh uses cached texture", () => {
  assert.ok(panelSource.includes("getProceduralTexture(panel.materialId)"));
  assert.ok(!panelSource.includes("new THREE.CanvasTexture"));
  assert.ok(!panelSource.includes("makeProceduralTexture(preset)"));
});

console.log("");
console.log("Texture cache tests:");
for (const r of results) {
  console.log(`  ${r.passed ? "✓" : "✗"} ${r.name}`);
  if (!r.passed && r.error) console.log(`      ${r.error}`);
}

const failed = results.filter((r) => !r.passed).length;
console.log("");
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed > 0 ? 1 : 0);
