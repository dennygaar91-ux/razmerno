import { constructorInitialState } from "./constructorStoreInitialState";
import type { ConstructorStoreState } from "./constructorStoreTypes";

export const createResetPreservingCheckoutPatch = (): Partial<ConstructorStoreState> => ({
  ...constructorInitialState,
});
