import type { ConstructorStoreState } from "./constructorStoreTypes";
import type { ConstructorStoreSet } from "./constructorStoreSliceTypes";
import type { ConstructorFillingLayout } from "../types";
import { deriveFromState } from "./constructorStoreDerivation";
import { CONSTRUCTOR_COMPARTMENT_LIMITS } from "./constructorStoreLimits";
import {
  clampCount,
  clampSectionsForWidth,
  ensureSelectedCompartment,
  ensureSelectedSection,
} from "./constructorStoreUtils";
import {
  createEvenSectionLayout,
  createUniformFacadeLayout,
  getFurnitureDefaults,
  normalizeCompartmentLayout,
  normalizeZoneFacadeLayout,
} from "../rules/projectRules";

type ConstructorFurnitureDimensionActions = Pick<
  ConstructorStoreState,
  "setFurniture" | "setWidth" | "setHeight" | "setDepth" | "setFill"
>;

export function createConstructorFurnitureDimensionActions(
  set: ConstructorStoreSet,
): ConstructorFurnitureDimensionActions {
  return {
  setFurniture: (furniture) =>
    set((state) => {
      const defaults = getFurnitureDefaults(furniture);
      const sectionLayout = createEvenSectionLayout(
        defaults.sections,
        defaults.width,
      );
      const compartmentLayout = normalizeCompartmentLayout({
        heightMm: defaults.height,
        compartments: defaults.compartments,
        sectionLayout,
      });
      const fillingLayout = Object.fromEntries(
        Object.entries(compartmentLayout).map(([sectionId, compartments]) => [
          sectionId,
          Object.fromEntries(
            compartments.map((compartment, compartmentIndex) => [
              compartment.id,
              {
                shelvesCount:
                  defaults.fill === "shelves" && compartmentIndex === 0
                    ? defaults.shelvesCount
                    : 0,
                drawersCount:
                  defaults.fill === "drawers" && compartmentIndex === 0
                    ? defaults.drawersCount
                    : 0,
                rodsCount:
                  defaults.fill === "rod" && compartmentIndex === 0
                    ? defaults.rodsCount
                    : 0,
              },
            ]),
          ),
        ]),
      ) as ConstructorFillingLayout;
      const selectedSectionId = sectionLayout[0]?.id ?? null;
      const facadeLayout = createUniformFacadeLayout(sectionLayout, "hinged");
      const zoneFacadeLayout = normalizeZoneFacadeLayout({ compartmentLayout });
      const next = {
        ...state,
        furniture,
        width: defaults.width,
        height: defaults.height,
        depth: defaults.depth,
        sections: sectionLayout.length,
        sectionLayout,
        selectedSectionId,
        compartmentLayout,
        fillingLayout,
        facadeLayout,
        zoneFacadeLayout,
        selectedCompartmentId: ensureSelectedCompartment(
          selectedSectionId,
          null,
          compartmentLayout,
        ),
        compartments: clampCount(
          defaults.compartments,
          CONSTRUCTOR_COMPARTMENT_LIMITS.min,
          CONSTRUCTOR_COMPARTMENT_LIMITS.max,
        ),
        fill: defaults.fill,
        shelvesCount: defaults.shelvesCount,
        drawersCount: defaults.drawersCount,
        rodsCount: defaults.rodsCount,
      };
      const derived = deriveFromState(next);
      return {
        ...next,
        ...derived,
        selectedSectionId,
        selectedCompartmentId: ensureSelectedCompartment(
          selectedSectionId,
          next.selectedCompartmentId,
          derived.compartmentLayout,
        ),
        selectedZoneId: ensureSelectedCompartment(
          selectedSectionId,
          next.selectedCompartmentId,
          derived.compartmentLayout,
        ),
      };
    }),
  setWidth: (width) =>
    set((state) => {
      const safeWidth = Math.max(0, width);
      const next = {
        ...state,
        width: safeWidth,
        sections: clampSectionsForWidth(state.sections, safeWidth),
      };
      const derived = deriveFromState(next);
      const selectedSectionId = ensureSelectedSection(
        state.selectedSectionId,
        derived.sectionLayout,
      );
      return {
        ...next,
        ...derived,
        selectedSectionId,
        selectedCompartmentId: ensureSelectedCompartment(
          selectedSectionId,
          state.selectedCompartmentId,
          derived.compartmentLayout,
        ),
        selectedZoneId: ensureSelectedCompartment(
          selectedSectionId,
          state.selectedCompartmentId,
          derived.compartmentLayout,
        ),
      };
    }),
  setHeight: (height) =>
    set((state) => {
      const next = { ...state, height: Math.max(0, height) };
      const derived = deriveFromState(next);
      const selectedSectionId = ensureSelectedSection(
        state.selectedSectionId,
        derived.sectionLayout,
      );
      const selectedZoneId = ensureSelectedCompartment(
        selectedSectionId,
        state.selectedCompartmentId,
        derived.compartmentLayout,
      );
      return {
        ...next,
        ...derived,
        selectedSectionId,
        selectedCompartmentId: selectedZoneId,
        selectedZoneId,
      };
    }),
  setDepth: (depth) =>
    set((state) => {
      const next = { ...state, depth: Math.max(0, depth) };
      return { ...next, ...deriveFromState(next) };
    }),
  setFill: (fill) =>
    set((state) => {
      const next = { ...state, fill };
      return { ...next, ...deriveFromState(next) };
    }),
  };
}
