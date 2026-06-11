import type {
  ConstructorCompartmentLayout,
  ConstructorFacadeMode,
  ConstructorSection,
  ConstructorSectionFacadeLayout,
  ConstructorZoneFacadeLayout,
  ConstructorZoneFacadeMode,
} from "../types";
import { CONSTRUCTOR_FACADE_RULES } from "./projectRuleConstants";

export function normalizeFacadeLayout(input: {
  sectionLayout: ConstructorSection[];
  facadeLayout?: ConstructorSectionFacadeLayout | null;
  defaultMode?: ConstructorFacadeMode;
}): ConstructorSectionFacadeLayout {
  const defaultMode = input.defaultMode ?? CONSTRUCTOR_FACADE_RULES.defaultMode;
  return input.sectionLayout.reduce<ConstructorSectionFacadeLayout>((result, section) => {
    const previous = input.facadeLayout?.[section.id];
    result[section.id] = previous === "open" || previous === "hinged" ? previous : defaultMode;
    return result;
  }, {});
}

export function setSectionFacadeModeInLayout(input: {
  sectionLayout: ConstructorSection[];
  facadeLayout?: ConstructorSectionFacadeLayout | null;
  sectionId: string;
  mode: ConstructorFacadeMode;
}): ConstructorSectionFacadeLayout {
  const normalized = normalizeFacadeLayout({
    sectionLayout: input.sectionLayout,
    facadeLayout: input.facadeLayout,
  });
  if (!input.sectionLayout.some((section) => section.id === input.sectionId)) {
    return normalized;
  }
  return { ...normalized, [input.sectionId]: input.mode };
}

export function createUniformFacadeLayout(
  sectionLayout: ConstructorSection[],
  mode: ConstructorFacadeMode,
): ConstructorSectionFacadeLayout {
  return sectionLayout.reduce<ConstructorSectionFacadeLayout>((result, section) => {
    result[section.id] = mode;
    return result;
  }, {});
}

export function normalizeZoneFacadeLayout(input: {
  compartmentLayout: ConstructorCompartmentLayout;
  zoneFacadeLayout?: ConstructorZoneFacadeLayout | null;
}): ConstructorZoneFacadeLayout {
  const result: ConstructorZoneFacadeLayout = {};
  for (const [sectionId, compartments] of Object.entries(input.compartmentLayout)) {
    result[sectionId] = {};
    for (const compartment of compartments) {
      const previous = input.zoneFacadeLayout?.[sectionId]?.[compartment.id];
      if (previous === "open") {
        result[sectionId][compartment.id] = "open";
      } else {
        result[sectionId][compartment.id] = "inherit";
      }
    }
  }
  return result;
}

export function setZoneFacadeModeInLayout(input: {
  compartmentLayout: ConstructorCompartmentLayout;
  zoneFacadeLayout?: ConstructorZoneFacadeLayout | null;
  sectionId: string;
  compartmentId: string;
  mode: ConstructorZoneFacadeMode;
}): ConstructorZoneFacadeLayout {
  const normalized = normalizeZoneFacadeLayout({
    compartmentLayout: input.compartmentLayout,
    zoneFacadeLayout: input.zoneFacadeLayout,
  });
  if (!normalized[input.sectionId]?.[input.compartmentId]) return normalized;
  return {
    ...normalized,
    [input.sectionId]: {
      ...normalized[input.sectionId],
      [input.compartmentId]: input.mode === "open" ? "open" : "inherit",
    },
  };
}

