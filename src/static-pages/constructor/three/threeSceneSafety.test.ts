import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getCameraPosition, getOrbitTarget } from "./threeCamera";

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

test("three reduced-quality: fallback CTA activates reduced mode through retryThreeScene(true)", () => {
  const page = read("src/static-pages/Constructor3DPage.tsx");
  const qualityHook = read("src/static-pages/constructor/three/useThreeSceneQuality.ts");

  assert.ok(page.includes("onUseReducedModel={() => retryThreeScene(true)}"));
  assert.ok(page.includes("setForceReduced3D(reduced)"));
  assert.ok(page.includes('forceReduced3D ? "reduced" : detectedThreeQuality'));
  assert.ok(qualityHook.includes('export type ThreeSceneQuality = "standard" | "reduced"'));
  assert.ok(qualityHook.includes("shouldUseReducedQuality"));
});

test("three reduced-quality: WebGL-available path still mounts LazyThreeFurnitureViewer", () => {
  const page = read("src/static-pages/Constructor3DPage.tsx");
  const viewer = read("src/static-pages/constructor/three/ThreeFurnitureViewer.tsx");

  assert.ok(page.includes('sceneRenderMode === "three" && webglAvailable && !threeFailed'));
  assert.ok(page.includes("{canRenderThree ? ("));
  assert.ok(page.includes("<LazyThreeFurnitureViewer"));
  assert.ok(page.includes("quality={threeQuality}"));
  assert.ok(viewer.includes('quality === "reduced"'));
  assert.ok(viewer.includes("shadows={!isReduced}"));
});

test("three reduced-quality: reduced 3D failure still keeps full 2D fallback with retry actions", () => {
  const page = read("src/static-pages/Constructor3DPage.tsx");

  assert.ok(page.includes("<TwoDFallbackScene"));
  assert.ok(page.includes("onRetry3D={() => retryThreeScene(false)}"));
  assert.ok(page.includes("onUseReducedModel={() => retryThreeScene(true)}"));
  assert.ok(page.includes("handleThreeRuntimeError"));
  assert.ok(page.includes(") : ("));
});

test("three camera framing: same dimensions and view mode produce deterministic camera pose", () => {
  const dimensions: [number, number, number] = [1.8, 2.4, 0.6];
  const sceneMode = "fill" as const;

  const positionA = getCameraPosition("front", dimensions, sceneMode);
  const positionB = getCameraPosition("front", dimensions, sceneMode);
  const targetA = getOrbitTarget(dimensions, sceneMode);
  const targetB = getOrbitTarget(dimensions, sceneMode);

  assert.deepEqual(positionA, positionB);
  assert.deepEqual(targetA, targetB);
});

test("three camera framing: dimension changes shift camera pose predictably", () => {
  const compact: [number, number, number] = [1.2, 2.0, 0.5];
  const enlarged: [number, number, number] = [2.4, 2.8, 0.8];
  const sceneMode = "fill" as const;

  const compactPosition = getCameraPosition("free", compact, sceneMode);
  const enlargedPosition = getCameraPosition("free", enlarged, sceneMode);
  const compactTarget = getOrbitTarget(compact, sceneMode);
  const enlargedTarget = getOrbitTarget(enlarged, sceneMode);

  assert.notDeepEqual(compactPosition, enlargedPosition);
  assert.notDeepEqual(compactTarget, enlargedTarget);
  assert.ok(enlargedPosition[1] > compactPosition[1], "camera height should follow model height");
  assert.ok(enlargedTarget[1] > compactTarget[1], "orbit target height should follow model height");
});

test("three camera framing: view mode changes reframe without a separate reset hook", () => {
  const dimensions: [number, number, number] = [1.8, 2.4, 0.6];
  const sceneMode = "sizes" as const;
  const viewModes = ["free", "front", "side", "top"] as const;
  const positions = viewModes.map((viewMode) => getCameraPosition(viewMode, dimensions, sceneMode));

  assert.equal(new Set(positions.map((position) => position.join(","))).size, viewModes.length);
});

test("three camera framing: viewer uses canonical model dimensions for camera pose", () => {
  const page = read("src/static-pages/Constructor3DPage.tsx");
  const viewer = read("src/static-pages/constructor/three/ThreeFurnitureViewer.tsx");
  const adapter = read("src/static-pages/constructor/three/threeSceneAdapter.ts");

  assert.ok(page.includes("widthMm: canonicalState.dimensions.widthMm"));
  assert.ok(page.includes("heightMm: canonicalState.dimensions.heightMm"));
  assert.ok(page.includes("depthMm: canonicalState.dimensions.depthMm"));
  assert.ok(viewer.includes("getCameraPosition(viewMode, model.dimensions, sceneMode)"));
  assert.ok(viewer.includes("getOrbitTarget(model.dimensions, sceneMode)"));
  assert.ok(adapter.includes("dimensions: [width, height, depth]"));
  assert.ok(!page.includes("widthMm: width,"));
  assert.ok(!page.includes("heightMm: height,"));
  assert.ok(!page.includes("depthMm: depth,"));
});

test("three runtime recovery: fallback scene keeps constructor path usable", () => {
  const page = read("src/static-pages/Constructor3DPage.tsx");
  const runtime = read("src/static-pages/constructor/components/SceneRuntimePanels.tsx");
  const lazyViewer = read("src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx");

  assert.ok(page.includes("TwoDFallbackScene"));
  assert.ok(page.includes("useBlueprintFallback"));
  assert.ok(runtime.includes("rzm-3d-blueprint-fallback"));
  assert.ok(runtime.includes("onRetry3D"));
  assert.ok(lazyViewer.includes("fallback"));
  assert.ok(page.includes("retryThreeScene"));
});

test("three runtime recovery: webgl availability hook is wired into scene status", () => {
  const scene = read("src/static-pages/constructor/components/ConstructorScene.tsx");
  const webglHook = read("src/static-pages/constructor/three/useWebGLAvailable.ts");
  const page = read("src/static-pages/Constructor3DPage.tsx");

  assert.ok(scene.includes("useWebGLDiagnostics"));
  assert.ok(webglHook.includes('get("rzm_webgl") === "off"'));
  assert.ok(page.includes("threeFailed"));
  assert.ok(page.includes("handleThreeRuntimeError"));
});

test("three camera framing: explicit runtime reset hook is not present", () => {
  const page = read("src/static-pages/Constructor3DPage.tsx");
  const viewer = read("src/static-pages/constructor/three/ThreeFurnitureViewer.tsx");

  assert.ok(page.includes("setSceneViewMode(mode)"));
  assert.ok(!page.match(/resetCamera|cameraReset|reset.*camera/i));
  assert.ok(!viewer.match(/resetCamera|cameraReset|reset.*camera/i));
});
