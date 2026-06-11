import type { ConstructorStoreState } from "./constructorStoreTypes";
import type { ConstructorStoreSet } from "./constructorStoreSliceTypes";
import {
  createBodyMaterialPatch,
  createFacadeMaterialPatch,
  createSyncedBackPanelMaterialPatch,
} from "./constructorMaterialState";

type ConstructorMaterialsActions = Pick<
  ConstructorStoreState,
  "setMaterial" | "setFacadeMaterial" | "syncBackPanelMaterial"
>;

export const createConstructorMaterialsActions = (
  set: ConstructorStoreSet,
): ConstructorMaterialsActions => ({
  setMaterial: (material) =>
    set((state) => createBodyMaterialPatch(state, material)),
  setFacadeMaterial: (facadeMaterial) =>
    set((state) => createFacadeMaterialPatch(state, facadeMaterial)),
  syncBackPanelMaterial: () =>
    set((state) => createSyncedBackPanelMaterialPatch(state)),
});
