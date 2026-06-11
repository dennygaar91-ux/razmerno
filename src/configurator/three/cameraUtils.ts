import type { ViewMode } from "./viewerTypes";

const MM_TO_M = 0.001;

export function cameraPositionForView(
  view: ViewMode,
  dim: { widthMm: number; heightMm: number; depthMm: number },
): [number, number, number] {
  const w = dim.widthMm * MM_TO_M;
  const h = dim.heightMm * MM_TO_M;
  const d = dim.depthMm * MM_TO_M;
  switch (view) {
    case "front":
      return [w / 2, h / 2, Math.max(d, w) * 2.2];
    case "side":
      return [w * 2.2, h / 2, d / 2];
    case "top":
      return [w / 2, Math.max(w, d) * 2.2, d / 2];
    default:
      return [w * 1.8, h * 1.1, d * 2.4];
  }
}

export function orthographicZoomForView(
  view: ViewMode,
  dim: { widthMm: number; heightMm: number; depthMm: number },
): number {
  const w = dim.widthMm * MM_TO_M;
  const h = dim.heightMm * MM_TO_M;
  const d = dim.depthMm * MM_TO_M;
  const frame =
    view === "top"
      ? Math.max(w, d)
      : view === "side"
      ? Math.max(h, d)
      : Math.max(w, h);
  return Math.max(70, Math.min(240, 1.9 / Math.max(frame, 0.5) * 100));
}
