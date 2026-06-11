export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function areaM2(widthMm: number, heightMm: number, quantity = 1): number {
  return round2((widthMm * heightMm * quantity) / 1_000_000)
}
