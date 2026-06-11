import { useConfigStore } from "./configStore";
import type { ConfigAction, ConfigState } from "../context";

/**
 * Тонкий мост между текущим провайдером и Zustand-хранилищем.
 * Нужен, чтобы `context.tsx` не импортировал `configStore.ts` напрямую
 * и не создавал смешанный статический/динамический импорт одного модуля.
 */
export function dispatchToConfigStore(action: ConfigAction) {
  useConfigStore.getState().dispatch(action);
}

export function mirrorConfigStateToStore(state: ConfigState) {
  useConfigStore.setState({ state });
}
