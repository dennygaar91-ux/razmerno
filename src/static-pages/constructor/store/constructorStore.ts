import { create } from "zustand";
import type { ConstructorStoreState } from "./constructorStoreTypes";
export type { ConstructorStoreState } from "./constructorStoreTypes";
export { constructorInitialState } from "./constructorStoreInitialState";
export { getMaxSectionsByWidth } from "./constructorStoreUtils";
export { CONSTRUCTOR_SECTION_LIMITS, CONSTRUCTOR_COMPARTMENT_LIMITS } from "./constructorStoreLimits";
import { constructorInitialState } from "./constructorStoreInitialState";
import { createConstructorCheckoutActions } from "./constructorCheckoutSlice";
import { createConstructorCompartmentActions } from "./constructorCompartmentSlice";
import { createConstructorFacadeActions } from "./constructorFacadeSlice";
import { createConstructorFurnitureDimensionActions } from "./constructorFurnitureDimensionsSlice";
import { createConstructorSectionActions } from "./constructorSectionSlice";
import { createConstructorMaterialsActions } from "./constructorMaterialsSlice";
import { createConstructorProductionSnapshotActions } from "./constructorProductionSnapshotSlice";
import { createConstructorSceneActions } from "./constructorSceneSlice";
import { createConstructorUtilityActions } from "./constructorUtilitySlice";
import { createConstructorFillingActions } from "./constructorFillingSlice";
import { createConstructorRandomPresetActions } from "./constructorRandomPresetSlice";
import { createConstructorAutoFixActions } from "./constructorAutoFixSlice";

export const useConstructorStore = create<ConstructorStoreState>((set) => ({
  ...constructorInitialState,
  setStep: (step) => set({ step }),
  ...createConstructorFurnitureDimensionActions(set),
  ...createConstructorSectionActions(set),
  ...createConstructorCompartmentActions(set),

  ...createConstructorFillingActions(set),
  ...createConstructorRandomPresetActions(set),
  ...createConstructorAutoFixActions(set),
  ...createConstructorFacadeActions(set),
  ...createConstructorMaterialsActions(set),
  ...createConstructorUtilityActions(set),
  ...createConstructorSceneActions(set),
  ...createConstructorProductionSnapshotActions(set),
  ...createConstructorCheckoutActions(set),
}));
