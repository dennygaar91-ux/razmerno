import type { ConfigState } from "../context";

/**
 * Transitional normalization entrypoint.
 *
 * Сейчас базовая нормализация сохраняет форму состояния и не меняет бизнес-логику.
 * Полная normalization logic будет перенесена из context/reducer отдельным этапом.
 */
export function normalizeConfigState(state: ConfigState): ConfigState {
  return {
    ...state,
    width: Math.round(state.width),
    height: Math.round(state.height),
    depth: Math.round(state.depth),
  };
}
