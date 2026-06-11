import type { ConstructorStoreState } from "./constructorStoreTypes";
import type { ConstructorStoreSet } from "./constructorStoreSliceTypes";
import { deriveFromState } from "./constructorStoreDerivation";
import {
  clampSectionsForWidth,
  ensureSelectedCompartment,
  ensureSelectedSection,
} from "./constructorStoreUtils";
import {
  createEvenSectionLayout,
  normalizeCompartmentLayout,
  normalizeFacadeLayout,
  normalizeZoneFacadeLayout,
  setSectionWidthInLayout,
} from "../rules/projectRules";

type ConstructorSectionActions = Pick<
  ConstructorStoreState,
  "setSections" | "setSectionWidth" | "equalizeSections" | "selectSection"
>;

export function createConstructorSectionActions(
  set: ConstructorStoreSet,
): ConstructorSectionActions {
  return {
  setSections: (sections) =>
    set((state) => {
      const safeSections = clampSectionsForWidth(sections, state.width);
      const sectionLayout = createEvenSectionLayout(safeSections, state.width);
      const compartmentLayout = normalizeCompartmentLayout({
        heightMm: state.height,
        compartments: state.compartments,
        sectionLayout,
        compartmentLayout: state.compartmentLayout,
      });
      const selectedSectionId = ensureSelectedSection(
        state.selectedSectionId,
        sectionLayout,
      );
      const facadeLayout = normalizeFacadeLayout({
        sectionLayout,
        facadeLayout: state.facadeLayout,
      });
      const zoneFacadeLayout = normalizeZoneFacadeLayout({
        compartmentLayout,
        zoneFacadeLayout: state.zoneFacadeLayout,
      });
      const next = {
        ...state,
        sections: sectionLayout.length,
        sectionLayout,
        selectedSectionId,
        compartmentLayout,
        fillingLayout: state.fillingLayout,
        facadeLayout,
        zoneFacadeLayout,
        selectedCompartmentId: ensureSelectedCompartment(
          selectedSectionId,
          state.selectedCompartmentId,
          compartmentLayout,
        ),
      };
      return { ...next, ...deriveFromState(next), selectedSectionId };
    }),
  setSectionWidth: (sectionId, widthMm) =>
    set((state) => {
      const sectionLayout = setSectionWidthInLayout({
        widthMm: state.width,
        sectionLayout: state.sectionLayout,
        sectionId,
        nextWidthMm: widthMm,
      });
      const next = {
        ...state,
        sections: sectionLayout.length,
        sectionLayout,
        selectedSectionId: sectionId,
      };
      const derived = deriveFromState(next);
      return {
        ...next,
        ...derived,
        selectedSectionId: ensureSelectedSection(sectionId, sectionLayout),
        selectedCompartmentId: ensureSelectedCompartment(
          sectionId,
          state.selectedCompartmentId,
          derived.compartmentLayout,
        ),
        selectedZoneId: ensureSelectedCompartment(
          sectionId,
          state.selectedCompartmentId,
          derived.compartmentLayout,
        ),
      };
    }),
  equalizeSections: () =>
    set((state) => {
      const sectionLayout = createEvenSectionLayout(
        state.sections,
        state.width,
      );
      const compartmentLayout = normalizeCompartmentLayout({
        heightMm: state.height,
        compartments: state.compartments,
        sectionLayout,
        compartmentLayout: state.compartmentLayout,
      });
      const selectedSectionId = ensureSelectedSection(
        state.selectedSectionId,
        sectionLayout,
      );
      const facadeLayout = normalizeFacadeLayout({
        sectionLayout,
        facadeLayout: state.facadeLayout,
      });
      const zoneFacadeLayout = normalizeZoneFacadeLayout({
        compartmentLayout,
        zoneFacadeLayout: state.zoneFacadeLayout,
      });
      const next = {
        ...state,
        sectionLayout,
        selectedSectionId,
        compartmentLayout,
        fillingLayout: state.fillingLayout,
        facadeLayout,
        zoneFacadeLayout,
        selectedCompartmentId: ensureSelectedCompartment(
          selectedSectionId,
          state.selectedCompartmentId,
          compartmentLayout,
        ),
      };
      return { ...next, ...deriveFromState(next), selectedSectionId };
    }),
  selectSection: (sectionId) =>
    set((state) => {
      const selectedSectionId = ensureSelectedSection(
        sectionId,
        state.sectionLayout,
      );
      return {
        selectedSectionId,
        selectedCompartmentId: ensureSelectedCompartment(
          selectedSectionId,
          state.selectedCompartmentId,
          state.compartmentLayout,
        ),
      };
    }),
  };
}
