export function clampCount(value: number, min: number, max: number) {
  return Math.max(
    min,
    Math.min(max, Math.floor(Number.isFinite(value) ? value : min)),
  );
}

export function roundMm(value: number) {
  return Math.max(0, Math.round(Number.isFinite(value) ? value : 0));
}
