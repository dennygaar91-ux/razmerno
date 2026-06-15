import { constructorInitialState } from "./constructorStoreInitialState";
import type { ConstructorStoreState } from "./constructorStoreTypes";

export const createResetPreservingCheckoutPatch = (
  _state: ConstructorStoreState,
): Partial<ConstructorStoreState> => ({
  ...constructorInitialState,
});
