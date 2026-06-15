import { constructorInitialState } from "./constructorStoreInitialState";
import type { ConstructorStoreState } from "./constructorStoreTypes";

export const createResetPreservingCheckoutPatch = (
  state: ConstructorStoreState,
): Partial<ConstructorStoreState> => ({
  ...constructorInitialState,
  step: state.step,
});
