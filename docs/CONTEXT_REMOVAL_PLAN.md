# Размерно — план удаления legacy ConfigProvider/useReducer

## Текущее состояние

Production UI уже не должен использовать прямой `useConfig()`.

Разрешённые остатки:

- `src/configurator/context.tsx`;
- `src/configurator/store/useConfigBridge.ts`;
- `src/configurator/store/providerStoreSync.test.ts`;
- `src/configurator/store/zustandBridge.test.tsx`.

## Почему нельзя удалить context прямо сейчас

`useConfigBridge()` всё ещё получает `dispatch` через Zustand selector, который синхронизирован с reducer/context transition layer.

Удаление без подготовки может сломать:

- initialization state;
- reducer-based normalization;
- existing compatibility tests;
- provider-store sync.

## Условия удаления

Перед удалением `ConfigProvider/useReducer` нужно:

1. Перенести reducer logic в Zustand store actions или отдельный pure state engine.
2. Сделать Zustand store единственным владельцем state.
3. Убрать `useConfigDispatchSelector`.
4. Переписать `useConfigBridge`, чтобы он не зависел от context dispatch.
5. Переписать `providerStoreSync.test`.
6. Переписать `zustandBridge.test`.
7. Добавить migration tests:
   - dimensions;
   - layout;
   - filling;
   - checkout;
   - production export.
8. Только после этого удалить:
   - `ConfigProvider`;
   - `useConfig`;
   - legacy dispatch context.

## Рекомендуемый безопасный порядок

### Stage A — Pure state engine

Вынести из `context.tsx` pure reducer/normalization logic в:

- `src/configurator/state/configReducer.ts`;
- `src/configurator/state/initialConfigState.ts`;
- `src/configurator/state/configNormalization.ts`.

### Stage B — Zustand owns reducer

Zustand store должен напрямую использовать pure reducer, без React Context.

### Stage C — Bridge without context

`useConfigBridge()` должен брать:

- state;
- derived data;
- actions;

только из Zustand.

### Stage D — Compatibility tests rewrite

Переписать tests, которые проверяют context sync, на Zustand-only tests.

### Stage E — Remove context

Удалить legacy provider и final guard должен запрещать `useConfig()` полностью.
