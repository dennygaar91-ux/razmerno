import { useMemo } from "react";
import {
  selectBodyMaterial,
  selectConfigState,
  selectDispatch,
  selectFacadeMaterial,
  selectFacadeStyle,
  selectHardware,
  selectPrice,
  selectValidation,
  useConfigStore,
} from "./configStore";

/**
 * Transitional selector bridge.
 *
 * Цель: дать новым/мигрируемым компонентам доступ к Zustand-селекторам
 * без немедленного удаления старого ConfigProvider.
 */
export function useConfigStateSelector() {
  return useConfigStore(selectConfigState);
}

export function useConfigDispatchSelector() {
  return useConfigStore(selectDispatch);
}

export function useConfigPriceSelector() {
  const state = useConfigStore(selectConfigState);
  return useMemo(() => selectPrice({ state, dispatch: useConfigStore.getState().dispatch, reset: useConfigStore.getState().reset }), [state]);
}

export function useConfigValidationSelector() {
  const state = useConfigStore(selectConfigState);
  return useMemo(() => selectValidation({ state, dispatch: useConfigStore.getState().dispatch, reset: useConfigStore.getState().reset }), [state]);
}

export function useConfigMaterialsSelector() {
  const state = useConfigStore(selectConfigState);

  return useMemo(() => {
    const store = { state, dispatch: useConfigStore.getState().dispatch, reset: useConfigStore.getState().reset };
    return {
      bodyMaterial: selectBodyMaterial(store),
      facadeMaterial: selectFacadeMaterial(store),
      facadeStyle: selectFacadeStyle(store),
      hardware: selectHardware(store),
    };
  }, [state]);
}
