import type { ConstructorStoreState } from "./constructorStoreTypes";
import type { ConstructorStoreSet } from "./constructorStoreSliceTypes";
import { deriveFromState } from "./constructorStoreDerivation";
import {
  ensureSelectedCompartment,
  ensureSelectedSection,
} from "./constructorStoreUtils";
import {
  createUniformFacadeLayout,
  normalizeZoneFacadeLayout,
  setSectionFacadeModeInLayout,
  setZoneFacadeModeInLayout,
} from "../rules/projectRules";

type ConstructorFacadeActions = Pick<
  ConstructorStoreState,
  | "setSectionFacadeMode"
  | "setZoneFacadeMode"
  | "setAllSectionFacadeMode"
  | "setHandleless"
>;

export function createConstructorFacadeActions(
  set: ConstructorStoreSet,
): ConstructorFacadeActions {
  return {
  setSectionFacadeMode: (sectionId, mode) =>
    set((state) => {
      const facadeLayout = setSectionFacadeModeInLayout({
        sectionLayout: state.sectionLayout,
        facadeLayout: state.facadeLayout,
        sectionId,
        mode,
      });
      const selectedSectionId = ensureSelectedSection(
        sectionId,
        state.sectionLayout,
      );
      const next = {
        ...state,
        facadeLayout,
        selectedSectionId,
      };
      return { ...next, ...deriveFromState(next), selectedSectionId };
    }),
  setZoneFacadeMode: (sectionId, compartmentId, mode) =>
    set((state) => {
      const selectedSectionId = ensureSelectedSection(
        sectionId,
        state.sectionLayout,
      );
      const selectedCompartmentId = ensureSelectedCompartment(
        selectedSectionId,
        compartmentId,
        state.compartmentLayout,
      );
      if (!selectedSectionId || !selectedCompartmentId) return state;
      const zoneFacadeLayout = setZoneFacadeModeInLayout({
        compartmentLayout: state.compartmentLayout,
        zoneFacadeLayout: state.zoneFacadeLayout,
        sectionId: selectedSectionId,
        compartmentId: selectedCompartmentId,
        mode,
      });
      const next = {
        ...state,
        zoneFacadeLayout,
        selectedSectionId,
        selectedCompartmentId,
      };
      return {
        ...next,
        ...deriveFromState(next),
        selectedSectionId,
        selectedCompartmentId,
      };
    }),
  setAllSectionFacadeMode: (mode) =>
    set((state) => {
      const facadeLayout = createUniformFacadeLayout(state.sectionLayout, mode);
      const zoneFacadeLayout =
        mode === "open"
          ? normalizeZoneFacadeLayout({
              compartmentLayout: state.compartmentLayout,
            })
          : state.zoneFacadeLayout;
      const next = { ...state, facadeLayout, zoneFacadeLayout };
      return { ...next, ...deriveFromState(next) };
    }),
  setHandleless: (handleless) => set({ handleless }),
  };
}
