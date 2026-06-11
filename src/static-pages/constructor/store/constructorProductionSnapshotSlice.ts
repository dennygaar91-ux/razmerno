import type { ConstructorStoreState } from "./constructorStoreTypes";
import type { ConstructorStoreSet } from "./constructorStoreSliceTypes";
import {
  createProductionSnapshotClearPatch,
  createProductionSnapshotErrorPatch,
  createProductionSnapshotLoadingPatch,
  createProductionSnapshotReadyPatch,
} from "./constructorProductionSnapshotState";

type ConstructorProductionSnapshotActions = Pick<
  ConstructorStoreState,
  | "setProductionSnapshotLoading"
  | "setProductionSnapshotReady"
  | "setProductionSnapshotError"
  | "clearProductionSnapshot"
>;

export const createConstructorProductionSnapshotActions = (
  set: ConstructorStoreSet,
): ConstructorProductionSnapshotActions => ({
  setProductionSnapshotLoading: () =>
    set((state) => createProductionSnapshotLoadingPatch(state)),
  setProductionSnapshotReady: (snapshot) =>
    set(createProductionSnapshotReadyPatch(snapshot)),
  setProductionSnapshotError: (error) =>
    set((state) => createProductionSnapshotErrorPatch(state, error)),
  clearProductionSnapshot: () => set(createProductionSnapshotClearPatch()),
});
