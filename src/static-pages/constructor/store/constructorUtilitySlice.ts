import type { ConstructorStoreState } from "./constructorStoreTypes";
import type { ConstructorStoreSet } from "./constructorStoreSliceTypes";
import { deriveFromState } from "./constructorStoreDerivation";
import { createRestoreDraftPatch } from "./constructorDraftRestoreState";
import { createFillingCounterPatch } from "./constructorFillCountState";
import { createResetPreservingCheckoutPatch } from "./constructorResetState";

type ConstructorUtilityActions = Pick<
  ConstructorStoreState,
  | "validateProject"
  | "setShelvesCount"
  | "setDrawersCount"
  | "setRodsCount"
  | "restoreDraft"
  | "reset"
>;

export const createConstructorUtilityActions = (
  set: ConstructorStoreSet,
): ConstructorUtilityActions => ({
  validateProject: () =>
    set((state) => ({ validation: deriveFromState(state).validation })),
  setShelvesCount: (shelvesCount) =>
    set((state) => createFillingCounterPatch(state, "shelvesCount", shelvesCount)),
  setDrawersCount: (drawersCount) =>
    set((state) => createFillingCounterPatch(state, "drawersCount", drawersCount)),
  setRodsCount: (rodsCount) =>
    set((state) => createFillingCounterPatch(state, "rodsCount", rodsCount)),
  restoreDraft: (draft) => set((state) => createRestoreDraftPatch(state, draft)),
  reset: () => set((state) => createResetPreservingCheckoutPatch(state)),
});
