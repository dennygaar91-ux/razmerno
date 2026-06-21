import type { ConstructorStoreState } from "./constructorStoreTypes";
import type { ConstructorStoreSet } from "./constructorStoreSliceTypes";
import { deriveFromState } from "./constructorStoreDerivation";
import { CONSTRUCTOR_COMPARTMENT_LIMITS } from "./constructorStoreLimits";
import {
  clampCount,
  ensureSelectedCompartment,
  ensureSelectedSection,
} from "./constructorStoreUtils";
import {
  createEvenCompartmentLayout,
  normalizeCompartmentLayout,
  setCompartmentHeightInLayout,
} from "../rules/projectRules";

type ConstructorCompartmentActions = Pick<
  ConstructorStoreState,
  | "setCompartments"
  | "setCompartmentHeight"
  | "equalizeCompartments"
  | "selectCompartment"
  | "selectZone"
>;

export function createConstructorCompartmentActions(
  set: ConstructorStoreSet,
): ConstructorCompartmentActions {
  return {
  setCompartments: (compartments) =>
    set((state) => {
      const safeCompartments = clampCount(
        compartments,
        CONSTRUCTOR_COMPARTMENT_LIMITS.min,
        CONSTRUCTOR_COMPARTMENT_LIMITS.max,
      );
      const compartmentLayout = normalizeCompartmentLayout({
        heightMm: state.height,
        compartments: safeCompartments,
        sectionLayout: state.sectionLayout,
      });
      const next = {
        ...state,
        compartments: safeCompartments,
        compartmentLayout,
        fillingLayout: state.fillingLayout,
        selectedCompartmentId: ensureSelectedCompartment(
          state.selectedSectionId,
          state.selectedCompartmentId,
          compartmentLayout,
        ),
      };
      const derived = deriveFromState(next);
      const selectedSectionId = ensureSelectedSection(
        state.selectedSectionId,
        derived.sectionLayout,
      );
      const selectedZoneId = ensureSelectedCompartment(
        selectedSectionId,
        next.selectedCompartmentId,
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
  setCompartmentHeight: (sectionId, compartmentId, heightMm) =>
    set((state) => {
      const compartmentLayout = setCompartmentHeightInLayout({
        heightMm: state.height,
        compartmentLayout: state.compartmentLayout,
        sectionId,
        compartmentId,
        nextHeightMm: heightMm,
      });
      const next = {
        ...state,
        compartmentLayout,
        selectedSectionId: ensureSelectedSection(
          sectionId,
          state.sectionLayout,
        ),
        selectedCompartmentId: ensureSelectedCompartment(
          sectionId,
          compartmentId,
          compartmentLayout,
        ),
      };
      const derived = deriveFromState(next);
      const selectedSectionId = ensureSelectedSection(
        next.selectedSectionId,
        derived.sectionLayout,
      );
      const selectedZoneId = ensureSelectedCompartment(
        selectedSectionId,
        next.selectedCompartmentId,
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
  equalizeCompartments: (sectionId) =>
    set((state) => {
      const targetSectionId =
        sectionId ??
        state.selectedSectionId ??
        state.sectionLayout[0]?.id ??
        null;
      if (!targetSectionId) return state;
      const compartmentLayout = {
        ...state.compartmentLayout,
        [targetSectionId]: createEvenCompartmentLayout(
          targetSectionId,
          state.compartments,
          state.height,
        ),
      };
      const next = {
        ...state,
        compartmentLayout,
        selectedSectionId: targetSectionId,
        selectedCompartmentId: ensureSelectedCompartment(
          targetSectionId,
          state.selectedCompartmentId,
          compartmentLayout,
        ),
      };
      const derived = deriveFromState(next);
      const selectedZoneId = ensureSelectedCompartment(
        targetSectionId,
        next.selectedCompartmentId,
        derived.compartmentLayout,
      );
      return {
        ...next,
        ...derived,
        selectedSectionId: targetSectionId,
        selectedCompartmentId: selectedZoneId,
        selectedZoneId,
      };
    }),
  selectCompartment: (sectionId, compartmentId) =>
    set((state) => {
      const selectedSectionId = ensureSelectedSection(
        sectionId,
        state.sectionLayout,
      );
      const selectedZoneId = ensureSelectedCompartment(
        selectedSectionId,
        compartmentId,
        state.compartmentLayout,
      );
      return {
        selectedSectionId,
        selectedCompartmentId: selectedZoneId,
        selectedZoneId,
      };
    }),
  selectZone: (sectionId, zoneId) =>
    set((state) => {
      const selectedSectionId = ensureSelectedSection(
        sectionId,
        state.sectionLayout,
      );
      const selectedZoneId = ensureSelectedCompartment(
        selectedSectionId,
        zoneId,
        state.compartmentLayout,
      );
      return {
        selectedSectionId,
        selectedCompartmentId: selectedZoneId,
        selectedZoneId,
      };
    }),  };
}
