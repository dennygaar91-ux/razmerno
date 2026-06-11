import type { ConstructorStoreState } from "./constructorStoreTypes";
import type { ConstructorStoreSet } from "./constructorStoreSliceTypes";
import {
  createAssemblyEnabledPatch,
  createConsentPatch,
  createContactPatch,
  createDeliveryAddressPatch,
  createDeliveryEnabledPatch,
} from "./constructorInteractionState";

type ConstructorCheckoutActions = Pick<
  ConstructorStoreState,
  | "setDeliveryEnabled"
  | "setAssemblyEnabled"
  | "setDeliveryAddress"
  | "setContact"
  | "setConsent"
>;

export const createConstructorCheckoutActions = (
  set: ConstructorStoreSet,
): ConstructorCheckoutActions => ({
  setDeliveryEnabled: (deliveryEnabled) =>
    set(createDeliveryEnabledPatch(deliveryEnabled)),
  setAssemblyEnabled: (assemblyEnabled) =>
    set(createAssemblyEnabledPatch(assemblyEnabled)),
  setDeliveryAddress: (deliveryAddress) =>
    set(createDeliveryAddressPatch(deliveryAddress)),
  setContact: (contact) => set(createContactPatch(contact)),
  setConsent: (consent) => set(createConsentPatch(consent)),
});
