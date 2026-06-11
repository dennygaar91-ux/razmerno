import type { ConstructorSection } from "../types";
import { CONSTRUCTOR_SECTION_RULES } from "./projectRuleConstants";
import { clampCount, roundMm } from "./ruleMath";



export function getMaxSectionsByWidth(widthMm: number) {
  return Math.max(
    CONSTRUCTOR_SECTION_RULES.minCount,
    Math.min(
      CONSTRUCTOR_SECTION_RULES.maxCount,
      Math.floor(Math.max(0, widthMm) / CONSTRUCTOR_SECTION_RULES.minWidthMm),
    ),
  );
}

export function clampSectionCountForWidth(count: number, widthMm: number) {
  return clampCount(
    count,
    CONSTRUCTOR_SECTION_RULES.minCount,
    getMaxSectionsByWidth(widthMm),
  );
}

function makeSectionId(index: number) {
  return `section-${index + 1}`;
}

export function createEvenSectionLayout(
  count: number,
  widthMm: number,
): ConstructorSection[] {
  const safeCount = clampSectionCountForWidth(count, widthMm);
  const base = Math.floor(Math.max(0, widthMm) / safeCount);
  let remainder = roundMm(widthMm) - base * safeCount;
  return Array.from({ length: safeCount }, (_, index) => {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return { id: makeSectionId(index), widthMm: base + extra };
  });
}

export function normalizeSectionLayout(input: {
  widthMm: number;
  sections: number;
  sectionLayout?: ConstructorSection[] | null;
}): ConstructorSection[] {
  const safeWidth = roundMm(input.widthMm);
  const safeCount = clampSectionCountForWidth(input.sections, safeWidth);
  const existing = Array.isArray(input.sectionLayout)
    ? input.sectionLayout.slice(0, safeCount)
    : [];
  if (
    existing.length !== safeCount ||
    safeWidth < CONSTRUCTOR_SECTION_RULES.minWidthMm * safeCount
  ) {
    return createEvenSectionLayout(safeCount, safeWidth);
  }

  const positive = existing.map((section, index) => ({
    id: section.id || makeSectionId(index),
    widthMm: Math.max(
      CONSTRUCTOR_SECTION_RULES.minWidthMm,
      roundMm(section.widthMm),
    ),
  }));
  const currentTotal = positive.reduce(
    (sum, section) => sum + section.widthMm,
    0,
  );
  if (currentTotal <= 0) return createEvenSectionLayout(safeCount, safeWidth);

  let scaled = positive.map((section) => ({
    ...section,
    widthMm: Math.max(
      CONSTRUCTOR_SECTION_RULES.minWidthMm,
      Math.floor((section.widthMm / currentTotal) * safeWidth),
    ),
  }));

  let diff =
    safeWidth - scaled.reduce((sum, section) => sum + section.widthMm, 0);
  let guard = 0;
  while (diff !== 0 && guard < 1000) {
    guard += 1;
    if (diff > 0) {
      const index = (guard - 1) % scaled.length;
      scaled[index] = { ...scaled[index], widthMm: scaled[index].widthMm + 1 };
      diff -= 1;
    } else {
      const index = scaled.findIndex(
        (section) => section.widthMm > CONSTRUCTOR_SECTION_RULES.minWidthMm,
      );
      if (index < 0) break;
      scaled[index] = { ...scaled[index], widthMm: scaled[index].widthMm - 1 };
      diff += 1;
    }
  }

  const total = scaled.reduce((sum, section) => sum + section.widthMm, 0);
  if (total !== safeWidth) return createEvenSectionLayout(safeCount, safeWidth);
  return scaled;
}

export function setSectionWidthInLayout(input: {
  widthMm: number;
  sectionLayout: ConstructorSection[];
  sectionId: string;
  nextWidthMm: number;
}): ConstructorSection[] {
  const layout = normalizeSectionLayout({
    widthMm: input.widthMm,
    sections: input.sectionLayout.length,
    sectionLayout: input.sectionLayout,
  });
  const targetIndex = layout.findIndex(
    (section) => section.id === input.sectionId,
  );
  if (targetIndex < 0) return layout;

  const minWidth = CONSTRUCTOR_SECTION_RULES.minWidthMm;
  const maxTargetWidth = Math.max(
    minWidth,
    roundMm(input.widthMm) - minWidth * (layout.length - 1),
  );
  const nextTargetWidth = Math.max(
    minWidth,
    Math.min(maxTargetWidth, roundMm(input.nextWidthMm)),
  );
  const delta = nextTargetWidth - layout[targetIndex].widthMm;
  if (delta === 0) return layout;

  const next = layout.map((section) => ({ ...section }));
  next[targetIndex].widthMm = nextTargetWidth;

  if (delta > 0) {
    let remaining = delta;
    for (let offset = 1; offset < next.length && remaining > 0; offset += 1) {
      const index = (targetIndex + offset) % next.length;
      const available = Math.max(0, next[index].widthMm - minWidth);
      const take = Math.min(available, remaining);
      next[index].widthMm -= take;
      remaining -= take;
    }
  } else {
    let remaining = Math.abs(delta);
    for (let offset = 1; offset < next.length && remaining > 0; offset += 1) {
      const index = (targetIndex + offset) % next.length;
      next[index].widthMm += remaining;
      remaining = 0;
    }
  }

  return normalizeSectionLayout({
    widthMm: input.widthMm,
    sections: next.length,
    sectionLayout: next,
  });
}

