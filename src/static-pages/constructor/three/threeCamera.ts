import type { ThreeSceneProductMode, ThreeSceneViewMode } from "./threeTypes";

export function getCameraPosition(
  viewMode: ThreeSceneViewMode,
  dimensions: [number, number, number],
  sceneMode: ThreeSceneProductMode = "fill",
): [number, number, number] {
  const [width, height, depth] = dimensions;
  const maxSize = Math.max(width, height, depth);
  const materialBoost = sceneMode === "materials" || sceneMode === "checkout" ? 0.88 : 1;

  if (viewMode === "front") return [0, height * 0.58, maxSize * 2.05 * materialBoost];
  if (viewMode === "side") return [maxSize * 2.08 * materialBoost, height * 0.62, depth * 0.18];
  if (viewMode === "top") return [0.05, maxSize * 2.28, 0.05];

  if (sceneMode === "materials" || sceneMode === "checkout") {
    return [maxSize * 1.12, height * 0.66, maxSize * 1.48];
  }
  if (sceneMode === "sizes") {
    return [maxSize * 1.26, height * 0.7, maxSize * 1.62];
  }
  return [maxSize * 1.22, height * 0.7, maxSize * 1.58];
}

export function getOrbitTarget(
  dimensions: [number, number, number],
  sceneMode: ThreeSceneProductMode = "fill",
): [number, number, number] {
  const [, height] = dimensions;
  return [0, height * (sceneMode === "checkout" ? 0.52 : 0.48), 0];
}
