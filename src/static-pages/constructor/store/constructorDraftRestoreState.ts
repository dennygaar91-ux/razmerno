import type { ConstructorStoreState } from "./constructorStoreTypes";
import {
  normalizeCompartmentLayout,
  normalizeFacadeLayout,
  normalizeSectionLayout,
} from "../rules/projectRules";
import { deriveFromState } from "./constructorStoreDerivation";
import {
  clampSectionsForWidth,
  ensureSelectedCompartment,
} from "./constructorStoreUtils";

export const createRestoreDraftPatch = (
  state: ConstructorStoreState,
  draft: ConstructorStoreState["restoreDraft"] extends (draft: infer Draft) => unknown
    ? Draft
    : never,
) => {
  const safeWidth = Math.max(0, draft.width);
  const safeHeight = Math.max(0, draft.height);
  const requestedSections = draft.sectionLayout?.length ?? draft.sections;
  const sectionLayout = normalizeSectionLayout({
    widthMm: safeWidth,
    sections: clampSectionsForWidth(requestedSections, safeWidth),
    sectionLayout: draft.sectionLayout,
  });
  const restoredCompartments =
    draft.compartments ??
    (sectionLayout[0]?.id
      ? draft.compartmentLayout?.[sectionLayout[0].id]?.length
      : undefined) ??
    state.compartments;
  const compartmentLayout = normalizeCompartmentLayout({
    heightMm: safeHeight,
    compartments: restoredCompartments,
    sectionLayout,
    compartmentLayout: draft.compartmentLayout,
  });
  const selectedSectionId = sectionLayout[0]?.id ?? null;
  const selectedCompartmentId = ensureSelectedCompartment(
    selectedSectionId,
    null,
    compartmentLayout,
  );
  const next = {
    ...state,
    width: safeWidth,
    height: safeHeight,
    depth: Math.max(0, draft.depth),
    sections: sectionLayout.length,
    sectionLayout,
    selectedSectionId,
    compartmentLayout,
    fillingLayout: draft.fillingLayout ?? state.fillingLayout,
    facadeLayout: normalizeFacadeLayout({
      sectionLayout,
      facadeLayout: draft.facadeLayout ?? state.facadeLayout,
    }),
    zoneFacadeLayout: draft.zoneFacadeLayout ?? state.zoneFacadeLayout,
    selectedCompartmentId,
    selectedZoneId: selectedCompartmentId,
    compartments: restoredCompartments,
    fill: draft.filling,
    furniture: draft.furniture,
    material: draft.material,
    facadeMaterial: draft.facadeMaterial ?? state.facadeMaterial,
    handleless: draft.handleless ?? state.handleless,
  } satisfies ConstructorStoreState;
  return {
    ...next,
    ...deriveFromState(next),
    selectedSectionId,
    selectedCompartmentId,
  };
};
