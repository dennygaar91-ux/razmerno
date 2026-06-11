import type { ConstructorProductionSnapshotState } from "../types";
import { initialProductionSnapshot } from "./constructorStoreInitialState";
import type { ConstructorStoreState } from "./constructorStoreTypes";

export type ReadyProductionSnapshotInput = Omit<
  ConstructorProductionSnapshotState,
  | "status"
  | "updatedAt"
  | "error"
  | "panelPricing"
  | "hardwarePricing"
  | "hardwareDecision"
  | "servicesPricing"
  | "servicesDecision"
> &
  Pick<
    Partial<ConstructorProductionSnapshotState>,
    | "panelPricing"
    | "hardwarePricing"
    | "hardwareDecision"
    | "servicesPricing"
    | "servicesDecision"
  >;

export const createProductionSnapshotLoadingPatch = (
  state: ConstructorStoreState,
): Pick<ConstructorStoreState, "productionSnapshot"> => ({
  productionSnapshot: {
    ...state.productionSnapshot,
    status: "loading",
    error: "",
  },
});

export const createProductionSnapshotReadyPatch = (
  snapshot: ReadyProductionSnapshotInput,
): Pick<ConstructorStoreState, "productionSnapshot"> => ({
  productionSnapshot: {
    ...snapshot,
    panelPricing: snapshot.panelPricing ?? null,
    hardwarePricing: snapshot.hardwarePricing ?? null,
    hardwareDecision: snapshot.hardwareDecision ?? null,
    servicesPricing: snapshot.servicesPricing ?? null,
    servicesDecision: snapshot.servicesDecision ?? null,
    status: "ready",
    updatedAt: new Date().toISOString(),
    error: "",
  },
});

export const createProductionSnapshotErrorPatch = (
  state: ConstructorStoreState,
  error: string,
): Pick<ConstructorStoreState, "productionSnapshot"> => ({
  productionSnapshot: {
    ...state.productionSnapshot,
    status: "error",
    updatedAt: new Date().toISOString(),
    error,
  },
});

export const createProductionSnapshotClearPatch = (): Pick<
  ConstructorStoreState,
  "productionSnapshot"
> => ({ productionSnapshot: initialProductionSnapshot });
