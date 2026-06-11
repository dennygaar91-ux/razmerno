import type { ConstructorStoreState } from "./constructorStoreTypes";
import type { ConstructorStoreSet } from "./constructorStoreSliceTypes";
import {
  createExactModePatch,
  createSceneRenderModePatch,
  createSceneViewModePatch,
} from "./constructorInteractionState";

type ConstructorSceneActions = Pick<
  ConstructorStoreState,
  | "setExactModeEnabled"
  | "setAdvancedSizes"
  | "setAdvancedFill"
  | "setSceneRenderMode"
  | "setSceneViewMode"
>;

export const createConstructorSceneActions = (
  set: ConstructorStoreSet,
): ConstructorSceneActions => ({
  setExactModeEnabled: (exactModeEnabled) =>
    set(createExactModePatch(exactModeEnabled)),
  setAdvancedSizes: (advancedSizes) => set(createExactModePatch(advancedSizes)),
  setAdvancedFill: (advancedFill) => set(createExactModePatch(advancedFill)),
  setSceneRenderMode: (sceneRenderMode) =>
    set(createSceneRenderModePatch(sceneRenderMode)),
  setSceneViewMode: (sceneViewMode) =>
    set(createSceneViewModePatch(sceneViewMode)),
});
