import type {
  ConstructorCompartmentFilling,
  ConstructorCompartmentLayout,
  FillKey,
} from "../types";
import type { ConstructorStoreState } from "./constructorStoreTypes";
import type { ConstructorStoreSet } from "./constructorStoreSliceTypes";
import { deriveFromState } from "./constructorStoreDerivation";
import { ensureSelectedSection } from "./constructorStoreUtils";
import { CONSTRUCTOR_COMPARTMENT_LIMITS } from "./constructorStoreLimits";
import { getFillingTotals } from "../rules/projectRules";

type ConstructorRandomPresetActions = Pick<
  ConstructorStoreState,
  "applyRandomPresetToSection"
>;

export function createConstructorRandomPresetActions(
  set: ConstructorStoreSet,
): ConstructorRandomPresetActions {
  return {
    applyRandomPresetToSection: (sectionId) =>
      set((state) => {
        const selectedSectionId = ensureSelectedSection(
          sectionId ?? state.selectedSectionId,
          state.sectionLayout,
        );
        if (!selectedSectionId) return state;

        const makeCompartment = (index: number, heightMm: number) => ({
          id: `${selectedSectionId}-compartment-${index + 1}`,
          heightMm,
        });
        const minHeight = CONSTRUCTOR_COMPARTMENT_LIMITS.minHeightMm;
        const safeHeight = Math.max(state.height, minHeight);
        let nextCompartments: ConstructorCompartmentLayout[string];
        let nextSectionFilling: Record<string, ConstructorCompartmentFilling>;
        let nextFill: FillKey = state.fill;

        if (state.furniture === "wardrobe" && safeHeight >= minHeight * 3) {
          const lowerHeight = Math.max(
            minHeight,
            Math.min(520, Math.round(safeHeight * 0.22)),
          );
          const topHeight = Math.max(
            minHeight,
            Math.min(420, Math.round(safeHeight * 0.16)),
          );
          const middleHeight = safeHeight - lowerHeight - topHeight;

          if (middleHeight >= minHeight) {
            nextCompartments = [
              makeCompartment(0, lowerHeight),
              makeCompartment(1, middleHeight),
              makeCompartment(2, topHeight),
            ];
          } else {
            const bottom = Math.floor(safeHeight / 2);
            nextCompartments = [
              makeCompartment(0, bottom),
              makeCompartment(1, safeHeight - bottom),
            ];
          }

          nextSectionFilling = nextCompartments.reduce<
            Record<string, ConstructorCompartmentFilling>
          >((result, compartment, index) => {
            result[compartment.id] = {
              shelvesCount: 0,
              drawersCount: index === 0 ? 2 : 0,
              rodsCount: index === 1 ? 1 : 0,
            };
            return result;
          }, {});
          nextFill = "rod";
        } else {
          nextCompartments = [makeCompartment(0, safeHeight)];
          const drawerCount = state.furniture === "dresser" ? 4 : 2;
          nextSectionFilling = {
            [nextCompartments[0].id]: {
              shelvesCount: 0,
              drawersCount: drawerCount,
              rodsCount: 0,
            },
          };
          nextFill = "drawers";
        }

        const compartmentLayout = {
          ...state.compartmentLayout,
          [selectedSectionId]: nextCompartments,
        };
        const fillingLayout = {
          ...state.fillingLayout,
          [selectedSectionId]: nextSectionFilling,
        };
        const zoneFacadeLayout = {
          ...state.zoneFacadeLayout,
          [selectedSectionId]: {},
        };
        const selectedCompartmentId = nextCompartments[0]?.id ?? null;
        const totals = getFillingTotals(fillingLayout);
        const next = {
          ...state,
          fill: nextFill,
          compartmentLayout,
          fillingLayout,
          zoneFacadeLayout,
          selectedSectionId,
          selectedCompartmentId,
          selectedZoneId: selectedCompartmentId,
          compartments: Math.max(state.compartments, nextCompartments.length),
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
