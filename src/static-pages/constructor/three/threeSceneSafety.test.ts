import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(file: string) {
  return readFileSync(file, "utf8");
}

test("three scene safety: viewer is lazy-loaded and guarded", () => {
  const scene = read("src/static-pages/constructor/components/ConstructorScene.tsx");
  const lazyViewer = read("src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx");
  const boundary = read("src/static-pages/constructor/components/ThreeSceneBoundary.tsx");

  assert.ok(scene.includes("<ConstructorSceneCanvas"));
  assert.ok(!scene.includes('from "../three/ThreeFurnitureViewer"'));
  assert.ok(lazyViewer.includes("lazy(() =>"));
  assert.ok(lazyViewer.includes("<ThreeSceneBoundary"));
  assert.ok(boundary.includes("getDerivedStateFromError"));
});

test("three scene safety: quality guard exists", () => {
  const quality = read("src/static-pages/constructor/three/useThreeSceneQuality.ts");
  const viewer = read("src/static-pages/constructor/three/ThreeFurnitureViewer.tsx");

  assert.ok(quality.includes("prefers-reduced-motion"));
  assert.ok(quality.includes("deviceMemory"));
  assert.ok(quality.includes("hardwareConcurrency"));
  assert.ok(viewer.includes("quality: ThreeSceneQuality"));
  assert.ok(viewer.includes("shadows={!isReduced}"));
});
