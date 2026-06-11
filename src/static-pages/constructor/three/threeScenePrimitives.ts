import type { ThreePanel } from "./threeTypes";

export const UNIT = 1000;

export function clampCount(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.floor(value || min)));
}

export function meters(valueMm: number) {
  return valueMm / UNIT;
}

export function pushPanel(panels: ThreePanel[], panel: ThreePanel) {
  panels.push(panel);
}

export function panel(input: Omit<ThreePanel, "position" | "size"> & {
  position: readonly [number, number, number];
  size: readonly [number, number, number];
}): ThreePanel {
  return {
    ...input,
    position: [...input.position] as [number, number, number],
    size: [...input.size] as [number, number, number],
  };
}
