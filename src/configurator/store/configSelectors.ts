import { MATERIALS, FACADE_STYLES, HARDWARE } from "../data";
import { calculatePrice, validate } from "../context";
import type { ConfigStoreState } from "./configStore";

export const selectConfigState = (store: ConfigStoreState) => store.state;
export const selectDispatch = (store: ConfigStoreState) => store.dispatch;
export const selectPrice = (store: ConfigStoreState) => calculatePrice(store.state);
export const selectValidation = (store: ConfigStoreState) => validate(store.state);
export const selectBodyMaterial = (store: ConfigStoreState) =>
  MATERIALS.find((material) => material.id === store.state.bodyMaterialId) ?? MATERIALS[0];
export const selectFacadeMaterial = (store: ConfigStoreState) =>
  MATERIALS.find((material) => material.id === store.state.facadeMaterialId) ?? MATERIALS[0];
export const selectFacadeStyle = (store: ConfigStoreState) =>
  FACADE_STYLES.find((style) => style.id === store.state.facadeStyleId) ?? FACADE_STYLES[0];
export const selectHardware = (store: ConfigStoreState) =>
  HARDWARE.find((item) => item.id === store.state.hardwareId) ?? HARDWARE[0];
