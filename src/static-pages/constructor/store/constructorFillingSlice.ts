import type { ConstructorStoreState } from "./constructorStoreTypes";
import type { ConstructorStoreSet } from "./constructorStoreSliceTypes";
import type { FillKey } from "../types";
import { deriveFromState } from "./constructorStoreDerivation";
import { ensureSelectedCompartment, ensureSelectedSection } from "./constructorStoreUtils";
import { CONSTRUCTOR_COMPARTMENT_LIMITS } from "./constructorStoreLimits";
import {
  getCompartmentFilling,
  getFillingTotals,
  removeCompartmentShelfDivider,
  setCompartmentFillingInLayout,
  splitCompartmentWithShelf,
} from "../rules/projectRules";

type ConstructorFillingActions = Pick<
  ConstructorStoreState,
  | "setCompartmentFilling"
  | "addShelfToCompartment"
  | "removeShelfDivider"
  | "removeCompartmentElement"
>;

export function createConstructorFillingActions(
  set: ConstructorStoreSet,
): ConstructorFillingActions {
  return {
    setCompartmentFilling: (sectionId, compartmentId, patch) =>
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
        const fillingLayout = setCompartmentFillingInLayout({
          fillingLayout: state.fillingLayout,
          sectionId: selectedSectionId,
          compartmentId: selectedCompartmentId,
          patch,
          furniture: state.furniture,
        });
        const totals = getFillingTotals(fillingLayout);
        const nextFill: FillKey =
          patch.rodsCount !== undefined && totals.rodsCount > 0
            ? "rod"
            : patch.drawersCount !== undefined && totals.drawersCount > 0
              ? "drawers"
              : patch.shelvesCount !== undefined && totals.shelvesCount > 0
                ? "shelves"
                : state.fill;
        const next = {
          ...state,
          fill: nextFill,
          fillingLayout,
          selectedSectionId,
          selectedCompartmentId,
          shelvesCount: totals.shelvesCount,
          drawersCount: totals.drawersCount,
          rodsCount: state.furniture === "wardrobe" ? totals.rodsCount : 0,
        };
        return {
          ...next,
          ...deriveFromState(next),
          selectedSectionId,
          selectedCompartmentId,
        };
      }),

    addShelfToCompartment: (
      sectionId,
      compartmentId,
      shelfHeightFromZoneBottomMm,
    ) =>
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
        const currentCompartment = state.compartmentLayout[
          selectedSectionId
        ]?.find((compartment) => compartment.id === selectedCompartmentId);
        const requestedShelfHeight =
          shelfHeightFromZoneBottomMm ??
          Math.min(
            900,
            Math.max(
              CONSTRUCTOR_COMPARTMENT_LIMITS.minHeightMm,
              Math.floor((currentCompartment?.heightMm ?? state.height) / 2),
            ),
          );
        const result = splitCompartmentWithShelf({
          heightMm: state.height,
          compartmentLayout: state.compartmentLayout,
          fillingLayout: state.fillingLayout,
          sectionId: selectedSectionId,
          compartmentId: selectedCompartmentId,
          shelfHeightFromZoneBottomMm: requestedShelfHeight,
          furniture: state.furniture,
        });
        const next = {
          ...state,
          compartmentLayout: result.compartmentLayout,
          fillingLayout: result.fillingLayout,
          selectedSectionId,
          selectedCompartmentId: result.selectedCompartmentId,
          selectedZoneId: result.selectedCompartmentId,
          compartments: Math.max(
            state.compartments,
            result.compartmentLayout[selectedSectionId]?.length ??
              state.compartments,
          ),
        };
        const totals = getFillingTotals(result.fillingLayout);
        return {
          ...next,
          ...deriveFromState(next),
          selectedSectionId,
          selectedCompartmentId: result.selectedCompartmentId,
          shelvesCount: totals.shelvesCount,
          drawersCount: totals.drawersCount,
          rodsCount: state.furniture === "wardrobe" ? totals.rodsCount : 0,
        };
      }),

    removeShelfDivider: (sectionId, lowerCompartmentId) =>
      set((state) => {
        const selectedSectionId = ensureSelectedSection(
          sectionId,
          state.sectionLayout,
        );
        if (!selectedSectionId) return state;
        const result = removeCompartmentShelfDivider({
          heightMm: state.height,
          compartmentLayout: state.compartmentLayout,
          fillingLayout: state.fillingLayout,
          sectionId: selectedSectionId,
          lowerCompartmentId,
          furniture: state.furniture,
        });
        const next = {
          ...state,
          compartmentLayout: result.compartmentLayout,
          fillingLayout: result.fillingLayout,
          selectedSectionId,
          selectedCompartmentId: result.selectedCompartmentId,
          selectedZoneId: result.selectedCompartmentId,
          compartments: Math.max(
            1,
            result.compartmentLayout[selectedSectionId]?.length ??
              state.compartments,
          ),
        };
        const totals = getFillingTotals(result.fillingLayout);
        return {
          ...next,
          ...deriveFromState(next),
          selectedSectionId,
          selectedCompartmentId: result.selectedCompartmentId,
          shelvesCount: totals.shelvesCount,
          drawersCount: totals.drawersCount,
          rodsCount: state.furniture === "wardrobe" ? totals.rodsCount : 0,
        };
      }),

    removeCompartmentElement: (sectionId, compartmentId, kind) =>
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
        const current = getCompartmentFilling({
          fillingLayout: state.fillingLayout,
          sectionId: selectedSectionId,
          compartmentId: selectedCompartmentId,
        });
        const nextCount = Math.max(0, (current[kind] ?? 0) - 1);
        const fillingLayout = setCompartmentFillingInLayout({
          fillingLayout: state.fillingLayout,
          sectionId: selectedSectionId,
          compartmentId: selectedCompartmentId,
          patch: { [kind]: nextCount },
          furniture: state.furniture,
        });
        const totals = getFillingTotals(fillingLayout);
        const next = {
          ...state,
          fillingLayout,
          selectedSectionId,
          selectedCompartmentId,
          shelvesCount: totals.shelvesCount,
          drawersCount: totals.drawersCount,
          rodsCount: state.furniture === "wardrobe" ? totals.rodsCount : 0,
        };
        return {
          ...next,
          ...deriveFromState(next),
          selectedSectionId,
          selectedCompartmentId,
        };
      }),
  };
}
