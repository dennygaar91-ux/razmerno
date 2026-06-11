import { useMemo } from "react";
import { createConfigActions } from "./configActions";
import {
  useConfigDispatchSelector,
  useConfigMaterialsSelector,
  useConfigPriceSelector,
  useConfigStateSelector,
  useConfigValidationSelector,
} from "./useConfigSelectors";

/**
 * Stable Zustand-first bridge for new configurator code.
 *
 * Старый `useConfig()` пока остаётся как compatibility layer, но новые компоненты
 * должны идти через этот bridge: state + derived data + typed actions.
 */
export function useConfigBridge() {
  const state = useConfigStateSelector();
  const dispatch = useConfigDispatchSelector();
  const price = useConfigPriceSelector();
  const validation = useConfigValidationSelector();
  const materials = useConfigMaterialsSelector();
  const actions = useMemo(() => createConfigActions(dispatch), [dispatch]);

  return {
    state,
    dispatch,
    actions,
    price,
    validation,
    ...materials,
  };
}
