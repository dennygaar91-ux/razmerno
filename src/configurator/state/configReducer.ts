import { configReducer as legacyConfigReducer } from "../context";
import type { ConfigAction, ConfigState } from "../context";
import { normalizeConfigState } from "./configNormalization";

export type { ConfigAction, ConfigState };

/**
 * Transitional pure reducer entrypoint.
 *
 * Пока reducer физически остаётся в `context.tsx`, этот модуль становится
 * единой точкой импорта для будущего переноса logic из React Context.
 */
export function configReducer(state: ConfigState, action: ConfigAction): ConfigState {
  return normalizeConfigState(legacyConfigReducer(state, action));
}
