import { create } from "zustand";
import { initialConfigState } from "../state/initialConfigState";
import { configReducer, type ConfigAction, type ConfigState } from "../state/configReducer";

export interface ConfigStoreState {
  state: ConfigState;
  dispatch: (action: ConfigAction) => void;
  reset: () => void;
}

export const useConfigStore = create<ConfigStoreState>((set) => ({
  state: initialConfigState,
  dispatch: (action) => set((current) => ({ state: configReducer(current.state, action) })),
  reset: () => set({ state: initialConfigState }),
}));

export {
  selectConfigState,
  selectDispatch,
  selectPrice,
  selectValidation,
  selectBodyMaterial,
  selectFacadeMaterial,
  selectFacadeStyle,
  selectHardware,
} from "./configSelectors";
