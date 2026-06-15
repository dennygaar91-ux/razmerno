import { constructorInitialState } from "./constructorStoreInitialState";
import type { ConstructorStoreState } from "./constructorStoreTypes";

export const createResetPreservingCheckoutPatch = (
  state: ConstructorStoreState,
): Partial<ConstructorStoreState> => ({
  ...constructorInitialState,
  step: state.step,
  contact: state.contact,
  consent: state.consent,
  deliveryEnabled: state.deliveryEnabled,
  assemblyEnabled: state.assemblyEnabled,
  deliveryAddress: state.deliveryAddress,
});
