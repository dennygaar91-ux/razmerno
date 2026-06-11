import type { ConstructorCompartmentLayout, ConstructorSection } from "../types";
import { clampSectionCountForWidth, getMaxSectionsByWidth } from "../rules/projectRules";

export function clampCount(value: number, min: number, max: number) {
  return Math.max(
    min,
    Math.min(max, Math.floor(Number.isFinite(value) ? value : min)),
  );
}

export { getMaxSectionsByWidth };

export function clampSectionsForWidth(sections: number, width: number) {
  return clampSectionCountForWidth(sections, width);
}

export function ensureSelectedSection(
  currentId: string | null,
  layout: ConstructorSection[],
) {
  if (currentId && layout.some((section) => section.id === currentId))
    return currentId;
  return layout[0]?.id ?? null;
}

export function ensureSelectedCompartment(
  sectionId: string | null,
  currentId: string | null,
  layout: ConstructorCompartmentLayout,
) {
  if (!sectionId) return null;
  const compartments = layout[sectionId] ?? [];
  if (
    currentId &&
    compartments.some((compartment) => compartment.id === currentId)
  ) {
    return currentId;
  }
  return compartments[0]?.id ?? null;
}
