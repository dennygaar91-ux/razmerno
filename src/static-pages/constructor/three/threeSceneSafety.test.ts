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
  assert.ok(viewer.includes('canvas.addEventListener("webglcontextlost"'));
  assert.ok(viewer.includes("onContextLost?.()"));
});

test("three runtime recovery: boundary failure maps to fallback and explicit retry remount", () => {
  const lazyViewer = read("src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx");
  const boundary = read("src/static-pages/constructor/components/ThreeSceneBoundary.tsx");
  const page = read("src/static-pages/Constructor3DPage.tsx");

  assert.ok(lazyViewer.includes("three-boundary-error"));
  assert.ok(lazyViewer.includes("buildThreeRuntimeResetKey"));
  assert.ok(lazyViewer.includes("recoveryKey"));
  assert.ok(boundary.includes("resetKey"));
  assert.ok(boundary.includes("getDerivedStateFromError"));
  assert.ok(page.includes("threeRecoveryAttempt"));
  assert.ok(page.includes("retryThreeScene"));
  assert.ok(page.includes("onRetry3D={() => retryThreeScene(false)}"));
  assert.ok(page.includes("recoveryKey={threeRecoveryAttempt}"));
});

test("three runtime recovery: load timeout clears on ready and uses fallback retry path", () => {
  const lazyViewer = read("src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx");
  const page = read("src/static-pages/Constructor3DPage.tsx");

  assert.ok(lazyViewer.includes("THREE_VIEWER_LOAD_TIMEOUT_MS"));
  assert.ok(lazyViewer.includes("three-load-timeout"));
  assert.ok(lazyViewer.includes("clearTimeout"));
  assert.ok(lazyViewer.includes("handleReady"));
  assert.ok(lazyViewer.includes("setTimedOut(false)"));
  assert.ok(page.includes("handleThreeRuntimeError"));
  assert.ok(page.includes("three-load-timeout") || page.includes("ThreeRuntimeFailureReason"));
});

test("three runtime recovery: context lost triggers fallback without auto restore", () => {
  const lazyViewer = read("src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx");
  const viewer = read("src/static-pages/constructor/three/ThreeFurnitureViewer.tsx");

  assert.ok(lazyViewer.includes("three-context-lost"));
  assert.ok(viewer.includes("webglcontextlost"));
  assert.ok(viewer.includes("preventDefault"));
  assert.ok(!viewer.includes('addEventListener("webglcontextrestored"'));
  assert.ok(viewer.includes("no webglcontextrestored auto-remount"));
});

test("three runtime recovery: successful ready clears runtime failure flags", () => {
  const page = read("src/static-pages/Constructor3DPage.tsx");

  assert.ok(page.includes("handleThreeReady"));
  assert.ok(page.includes("setThreeFailed(false)"));
  assert.ok(page.includes("setThreeFailureReason(null)"));
});
