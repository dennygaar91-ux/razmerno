import type { ConstructorStoreState } from "./constructorStoreTypes";
import type { ConstructorStoreSet } from "./constructorStoreSliceTypes";
import { initialMaterials } from "./constructorStoreInitialState";
import { deriveFromState } from "./constructorStoreDerivation";
import {
  clampCount,
  clampSectionsForWidth,
  ensureSelectedCompartment,
  ensureSelectedSection,
} from "./constructorStoreUtils";
import { CONSTRUCTOR_COMPARTMENT_LIMITS } from "./constructorStoreLimits";
import {
  CONSTRUCTOR_COMPARTMENT_RULES,
  CONSTRUCTOR_DIMENSION_LIMITS,
  CONSTRUCTOR_FILLING_RULES,
  createEvenSectionLayout,
  getFillingTotals,
  normalizeCompartmentLayout,
  setCompartmentFillingInLayout,
  setSectionFacadeModeInLayout,
} from "../rules/projectRules";

type ConstructorAutoFixActions = Pick<
  ConstructorStoreState,
  "applyAutoFixForIssue"
>;

export function createConstructorAutoFixActions(
  set: ConstructorStoreSet,
): ConstructorAutoFixActions {
  return {
    applyAutoFixForIssue: (issueId) =>
      set((state) => {
        const issue = issueId
          ? state.validation.issues.find((item) => item.id === issueId)
          : (state.validation.issues.find((item) => item.severity === "error") ??
            state.validation.issues[0]);
        if (!issue) return state;

        const sectionId =
          issue.targetType === "section" || issue.targetType === "facade"
            ? (issue.targetId ??
              state.selectedSectionId ??
              state.sectionLayout[0]?.id ??
              null)
            : (state.selectedSectionId ?? state.sectionLayout[0]?.id ?? null);
        const compartmentId =
          issue.targetType === "compartment"
            ? (issue.targetId ?? state.selectedCompartmentId)
            : state.selectedCompartmentId;

        let next: ConstructorStoreState = { ...state };

        if (issue.id === "dimensions-width-range") {
          const limits =
            CONSTRUCTOR_DIMENSION_LIMITS[state.furniture] ??
            CONSTRUCTOR_DIMENSION_LIMITS.wardrobe;
          next = {
            ...next,
            width: Math.max(
              limits.minWidthMm,
              Math.min(limits.maxWidthMm, state.width),
            ),
          };
        } else if (issue.id === "dimensions-height-range") {
          const limits =
            CONSTRUCTOR_DIMENSION_LIMITS[state.furniture] ??
            CONSTRUCTOR_DIMENSION_LIMITS.wardrobe;
          next = {
            ...next,
            height: Math.max(
              limits.minHeightMm,
              Math.min(limits.maxHeightMm, state.height),
            ),
          };
        } else if (issue.id === "dimensions-depth-range") {
          const limits =
            CONSTRUCTOR_DIMENSION_LIMITS[state.furniture] ??
            CONSTRUCTOR_DIMENSION_LIMITS.wardrobe;
          next = {
            ...next,
            depth: Math.max(
              limits.minDepthMm,
              Math.min(limits.maxDepthMm, state.depth),
            ),
          };
        } else if (
          issue.id === "sections-min-width" ||
          issue.id.endsWith("-min-width")
        ) {
          const sections = clampSectionsForWidth(state.sections, state.width);
          const sectionLayout = createEvenSectionLayout(sections, state.width);
          const selectedSectionId = ensureSelectedSection(
            state.selectedSectionId,
            sectionLayout,
          );
          next = { ...next, sections, sectionLayout, selectedSectionId };
        } else if (issue.id.includes("wide-hinged") && sectionId) {
          next = {
            ...next,
            facadeLayout: setSectionFacadeModeInLayout({
              sectionLayout: state.sectionLayout,
              facadeLayout: state.facadeLayout,
              sectionId,
              mode: "open",
            }),
            selectedSectionId: sectionId,
          };
        } else if (
          issue.id.includes("-shelves-gap") &&
          sectionId &&
          compartmentId
        ) {
          const compartment = state.compartmentLayout[sectionId]?.find(
            (item) => item.id === compartmentId,
          );
          const maxShelves = Math.max(
            0,
            Math.floor(
              (compartment?.heightMm ?? 0) /
                CONSTRUCTOR_FILLING_RULES.minShelfGapMm,
            ) - 1,
          );
          next = {
            ...next,
            fillingLayout: setCompartmentFillingInLayout({
              fillingLayout: state.fillingLayout,
              sectionId,
              compartmentId,
              patch: { shelvesCount: maxShelves },
              furniture: state.furniture,
            }),
            selectedSectionId: sectionId,
            selectedCompartmentId: compartmentId,
          };
        } else if (
          issue.id.includes("-drawers-height") &&
          sectionId &&
          compartmentId
        ) {
          const compartment = state.compartmentLayout[sectionId]?.find(
            (item) => item.id === compartmentId,
          );
          const maxDrawers = Math.max(
            0,
            Math.floor(
              (compartment?.heightMm ?? 0) /
                CONSTRUCTOR_FILLING_RULES.minDrawerFrontHeightMm,
            ),
          );
          next = {
            ...next,
            fillingLayout: setCompartmentFillingInLayout({
              fillingLayout: state.fillingLayout,
              sectionId,
              compartmentId,
              patch: { drawersCount: maxDrawers },
              furniture: state.furniture,
            }),
            selectedSectionId: sectionId,
            selectedCompartmentId: compartmentId,
          };
        } else if (
          (issue.id.includes("-rod-height") || issue.id.includes("rod-only")) &&
          sectionId &&
          compartmentId
        ) {
          next = {
            ...next,
            fillingLayout: setCompartmentFillingInLayout({
              fillingLayout: state.fillingLayout,
              sectionId,
              compartmentId,
              patch: { rodsCount: 0 },
              furniture: state.furniture,
            }),
            selectedSectionId: sectionId,
            selectedCompartmentId: compartmentId,
          };
        } else if (
          issue.id === "compartments-min-height" ||
          issue.id.includes("-min-height")
        ) {
          const safeCompartments = clampCount(
            Math.floor(state.height / CONSTRUCTOR_COMPARTMENT_RULES.minHeightMm),
            CONSTRUCTOR_COMPARTMENT_LIMITS.min,
            CONSTRUCTOR_COMPARTMENT_LIMITS.max,
          );
          next = {
            ...next,
            compartments: safeCompartments,
            compartmentLayout: normalizeCompartmentLayout({
              heightMm: state.height,
              compartments: safeCompartments,
              sectionLayout: state.sectionLayout,
            }),
          };
        } else if (issue.id === "material-body-kind") {
          next = { ...next, material: initialMaterials.bodyMaterialId };
        } else if (issue.id === "material-facade-kind") {
          next = { ...next, facadeMaterial: initialMaterials.facadeMaterialId };
        }

        const totals = getFillingTotals(next.fillingLayout);
        const derived = deriveFromState({
          ...next,
          shelvesCount: totals.shelvesCount,
          drawersCount: totals.drawersCount,
          rodsCount: next.furniture === "wardrobe" ? totals.rodsCount : 0,
        });
        const selectedSectionId = ensureSelectedSection(
          next.selectedSectionId,
          derived.sectionLayout,
        );
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
  };
}
