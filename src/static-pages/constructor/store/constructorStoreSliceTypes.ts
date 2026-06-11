import type { ConstructorStoreState } from "./constructorStoreTypes";

export type ConstructorStorePatch = Partial<ConstructorStoreState>;

export type ConstructorStoreSet = (
  partial:
    | ConstructorStorePatch
    | ConstructorStoreState
    | ((state: ConstructorStoreState) => ConstructorStorePatch | ConstructorStoreState),
  replace?: false,
) => void;
