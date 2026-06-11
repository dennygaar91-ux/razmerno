import type {
  ConstructorCompartmentFilling,
  ConstructorCompartmentLayout,
  ConstructorFillingLayout,
  FurnitureKey,
} from "../types";
import { CONSTRUCTOR_FILLING_RULES } from "./projectRuleConstants";

export const EMPTY_COMPARTMENT_FILLING: ConstructorCompartmentFilling = {
  shelvesCount: 0,
  drawersCount: 0,
  rodsCount: 0,
};

function clampFilling(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.floor(Number.isFinite(value) ? value : 0)));
}

export function normalizeCompartmentFilling(
  filling?: Partial<ConstructorCompartmentFilling> | null,
): ConstructorCompartmentFilling {
  return {
    shelvesCount: clampFilling(
      filling?.shelvesCount ?? 0,
      CONSTRUCTOR_FILLING_RULES.maxShelvesPerCompartment,
    ),
    drawersCount: clampFilling(
      filling?.drawersCount ?? 0,
      CONSTRUCTOR_FILLING_RULES.maxDrawersPerCompartment,
    ),
    rodsCount: clampFilling(
      filling?.rodsCount ?? 0,
      CONSTRUCTOR_FILLING_RULES.maxRodsPerCompartment,
    ),
  };
}

export function normalizeFillingLayout(input: {
  furniture: FurnitureKey;
  compartmentLayout: ConstructorCompartmentLayout;
  fillingLayout?: ConstructorFillingLayout | null;
  fallback?: Partial<ConstructorCompartmentFilling>;
}): ConstructorFillingLayout {
  const result: ConstructorFillingLayout = {};
  for (const [sectionId, compartments] of Object.entries(input.compartmentLayout)) {
    result[sectionId] = {};
    for (const compartment of compartments) {
      const previous = input.fillingLayout?.[sectionId]?.[compartment.id];
      const normalized = normalizeCompartmentFilling(previous ?? input.fallback);
      result[sectionId][compartment.id] = {
        ...normalized,
        rodsCount: input.furniture === "wardrobe" ? normalized.rodsCount : 0,
      };
    }
  }
  return result;
}

export function getCompartmentFilling(input: {
  fillingLayout?: ConstructorFillingLayout | null;
  sectionId?: string | null;
  compartmentId?: string | null;
}): ConstructorCompartmentFilling {
  if (!input.sectionId || !input.compartmentId) return EMPTY_COMPARTMENT_FILLING;
  return normalizeCompartmentFilling(
    input.fillingLayout?.[input.sectionId]?.[input.compartmentId],
  );
}

export function getFillingTotals(
  fillingLayout?: ConstructorFillingLayout | null,
): ConstructorCompartmentFilling {
  const totals = { ...EMPTY_COMPARTMENT_FILLING };
  if (!fillingLayout) return totals;
  for (const section of Object.values(fillingLayout)) {
    for (const filling of Object.values(section)) {
      const normalized = normalizeCompartmentFilling(filling);
      totals.shelvesCount += normalized.shelvesCount;
      totals.drawersCount += normalized.drawersCount;
      totals.rodsCount += normalized.rodsCount;
    }
  }
  return totals;
}

export function setCompartmentFillingInLayout(input: {
  fillingLayout: ConstructorFillingLayout;
  sectionId: string;
  compartmentId: string;
  patch: Partial<ConstructorCompartmentFilling>;
  furniture: FurnitureKey;
}): ConstructorFillingLayout {
  const current = getCompartmentFilling({
    fillingLayout: input.fillingLayout,
    sectionId: input.sectionId,
    compartmentId: input.compartmentId,
  });
  const next = normalizeCompartmentFilling({ ...current, ...input.patch });
  if (input.furniture !== "wardrobe") next.rodsCount = 0;
  return {
    ...input.fillingLayout,
    [input.sectionId]: {
      ...(input.fillingLayout[input.sectionId] ?? {}),
      [input.compartmentId]: next,
    },
  };
}

