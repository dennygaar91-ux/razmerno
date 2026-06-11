import type { ConstructorStoreState } from "./constructorStoreTypes";

export const createExactModePatch = (exactModeEnabled: boolean) => ({
  exactModeEnabled,
  advancedSizes: exactModeEnabled,
  advancedFill: exactModeEnabled,
});

export const createSceneRenderModePatch = (
  sceneRenderMode: ConstructorStoreState["sceneRenderMode"],
) => ({ sceneRenderMode });

export const createSceneViewModePatch = (
  sceneViewMode: ConstructorStoreState["sceneViewMode"],
) => ({ sceneViewMode });

export const createDeliveryEnabledPatch = (deliveryEnabled: boolean) => ({
  deliveryEnabled,
});

export const createAssemblyEnabledPatch = (assemblyEnabled: boolean) => ({
  assemblyEnabled,
});

export const createDeliveryAddressPatch = (deliveryAddress: string) => ({
  deliveryAddress,
});

export const createContactPatch = (
  contact: ConstructorStoreState["contact"],
) => ({ contact });

export const createConsentPatch = (consent: boolean) => ({ consent });
