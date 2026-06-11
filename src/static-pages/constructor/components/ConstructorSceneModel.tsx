import type { ConstructorSection, FillKey } from "../types";

export type ModelMetrics = {
  x: number;
  y: number;
  width: number;
  height: number;
  innerLeft: number;
  innerRight: number;
  innerTop: number;
  innerBottom: number;
  depthOffset: number;
  radius: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function getFillLabel(fill: FillKey) {
  if (fill === "drawers") return "Ящики";
  if (fill === "rod") return "Штанга";
  return "Полки";
}

export function getModelMetrics(
  widthMm: number,
  heightMm: number,
  depthMm: number,
): ModelMetrics {
  const visualWidth = clamp(218 + ((widthMm - 1200) / 1400) * 82, 218, 304);
  const visualHeight = clamp(304 + ((heightMm - 2000) / 800) * 72, 304, 382);
  const depthOffset = clamp(12 + ((depthMm - 400) / 500) * 24, 12, 38);
  const x = (360 - visualWidth - depthOffset) / 2;
  const y = (420 - visualHeight - depthOffset) / 2 + 2;

  return {
    x,
    y,
    width: visualWidth,
    height: visualHeight,
    innerLeft: x + 20,
    innerRight: x + visualWidth - 20,
    innerTop: y + 28,
    innerBottom: y + visualHeight - 22,
    depthOffset,
    radius: clamp(18 + visualWidth / 24, 20, 28),
  };
}

export function getProportionLabel(
  width: number,
  height: number,
  depth: number,
) {
  const ratio = width / Math.max(1, height);
  if (depth >= 750) return "Глубокий корпус";
  if (ratio >= 0.9) return "Широкая модель";
  if (height >= 2500) return "Высокая модель";
  return "Сбалансированная модель";
}

export function getModelSections(
  sections: number,
  metrics: ModelMetrics,
  sectionLayout?: ConstructorSection[],
  totalWidthMm?: number,
) {
  const safeSections = Math.max(1, Math.min(6, Math.floor(sections || 1)));
  const innerWidth = metrics.innerRight - metrics.innerLeft;
  const layoutTotal =
    sectionLayout?.reduce((sum, section) => sum + section.widthMm, 0) ?? 0;
  const ratioTotal = Math.max(1, totalWidthMm ?? layoutTotal);
  const useLayout =
    Array.isArray(sectionLayout) &&
    sectionLayout.length === safeSections &&
    layoutTotal > 0;

  const innerSections = Array.from({ length: safeSections }, (_, index) => {
    const section = sectionLayout?.[index];
    const ratio = useLayout
      ? Math.max(0, (section?.widthMm ?? 0) / ratioTotal)
      : 1 / safeSections;
    const w = innerWidth * ratio;
    const previousWidth = useLayout
      ? (sectionLayout ?? [])
          .slice(0, index)
          .reduce(
            (sum, item) => sum + (innerWidth * item.widthMm) / ratioTotal,
            0,
          )
      : (innerWidth / safeSections) * index;
    return {
      id: section?.id ?? `section-${index + 1}`,
      x: metrics.innerLeft + previousWidth,
      w,
      widthMm: section?.widthMm,
    };
  });

  const verticalLines = innerSections.slice(1).map((section) => section.x);

  return {
    safeSections,
    verticalLines,
    innerSections,
  };
}

export function getShelfLines(compartments: number, metrics: ModelMetrics) {
  const safeCompartments = Math.max(
    2,
    Math.min(5, Math.floor(compartments || 2)),
  );
  const innerHeight = metrics.innerBottom - metrics.innerTop;
  return Array.from(
    { length: Math.max(1, safeCompartments - 1) },
    (_, index) =>
      metrics.innerTop + (innerHeight / safeCompartments) * (index + 1),
  );
}
