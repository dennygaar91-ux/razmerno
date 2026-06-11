# Stage 03 — 3D runtime stability

Дата: 2026-06-10

## Цель

Стабилизировать активную 3D-first ветку конструктора перед дальнейшей UX-пересборкой: убрать риск пустой сцены, добавить runtime-guard для Three.js/WebGL, обеспечить понятный recovery path без возврата пользователя в legacy-конструктор.

## Что изменено

### 1. Active Constructor3DPage runtime state

Файл: `src/static-pages/Constructor3DPage.tsx`

- Добавлено хранение причины падения 3D: `threeFailureReason`.
- Добавлен единый обработчик runtime ошибок: `handleThreeRuntimeError`.
- Добавлен обработчик успешного старта сцены: `handleThreeReady`.
- Добавлен retry/reduced recovery path: `retryThreeScene`.
- Fallback больше не ведёт пользователя в legacy route `/configurator`.
- Stagebar больше не пишет `3D проверяется` для всех fallback-сценариев: теперь различает `3D готово`, `Проверяем 3D`, `2D fallback`, `3D fallback`.

### 2. Lazy Three viewer guard

Файл: `src/static-pages/constructor/components/LazyThreeFurnitureViewer.tsx`

- Добавлен load-timeout guard: `THREE_VIEWER_LOAD_TIMEOUT_MS = 8000`.
- Timeout сообщает наверх `three-load-timeout`.
- Boundary/failure layer передаёт тип ошибки: `three-boundary-error`, `three-load-timeout`, `three-context-lost`.
- `onError` стабилизирован через `useRef`, чтобы timeout не сбрасывался из-за изменения callback reference.

### 3. ThreeSceneBoundary recovery

Файл: `src/static-pages/constructor/components/ThreeSceneBoundary.tsx`

- Boundary теперь получает `resetKey`.
- После retry/reset key меняется, и boundary может выйти из `hasError` без перезагрузки всей страницы.
- `componentDidCatch` передаёт исходную ошибку и `ErrorInfo` в callback.

### 4. WebGL context loss guard

Файл: `src/static-pages/constructor/three/ThreeFurnitureViewer.tsx`

- Добавлен `ThreeCanvasRuntimeGuard` внутри Canvas.
- Guard вызывает `onReady` после готовности renderer context.
- Guard слушает `webglcontextlost` на canvas.
- При потере context вызывает `onContextLost`, что переводит страницу в fallback state.

### 5. Stage 3 guard script

Файл: `scripts/check-stage03-three-runtime-stability.mjs`

Добавлена статическая проверка, что:

- active 3D page обрабатывает runtime failures;
- причина падения хранится явно;
- есть retry/reduced recovery path;
- lazy viewer имеет timeout guard;
- boundary умеет recover через `resetKey`;
- viewer слушает `webglcontextlost`;
- fallback не отправляет пользователя в legacy-конструктор.

Package script:

```bash
npm run check:stage03-three-runtime-stability
```

## Не изменялось

- Не менял визуальный UX shell.
- Не менял pricing/order flow.
- Не менял geometry/production model.
- Не начинал Stage 4 2D fallback.
- Не удалял legacy-код.
- Не делал CSS cleanup.

## Риски

### Высокий

1. Полный Playwright browser E2E всё ещё зависит от наличия Chromium в среде. В текущей среде executable не установлен, поэтому полноценный runtime browser QA нужно повторить локально/в CI.

### Средний

1. Сейчас fallback в активной 3D-ветке является runtime fallback state, но ещё не полноценным 2D/SVG рабочим режимом. Это план Stage 4.
2. `three-core` chunk остаётся крупным, хотя viewer lazy-loaded. Глубокая performance-оптимизация отложена.

### Низкий

1. Timeout 8000 мс выбран как безопасный UX-guard. В будущем его можно вынести в config, если будут реальные метрики загрузки.

## Проверки

Успешно:

- `npm run typecheck`
- `npm run build`
- `npm run qa:static`
- `npm run validate:config`
- `npm run check:pre-stage3-debt`
- `npm run check:stage03-three-runtime-stability`
- `npm run check:stage-q10-q11-reset-wcag`
- `npm run test:constructor-three-safety`
- `npm run test:constructor-three`
- `npm run test:browser-smoke-static`
- `npm run test:ui-e2e`
- `npm run test:pricing-final`
- `npm run test:three-final`
- `npm run test:geometry`
- `npm run test:layout-state`
- `npm run test:compartment-ui`
- `npm run test:three-layout-markers`

Не запускалось как успешная проверка:

- `npm run test:constructor3d-e2e` — в текущей среде нет установленного Playwright Chromium executable.
- `npm run check:stage-q9-loading-performance` — исторический stage-specific guard ожидает старые Q9 markers и не является актуальным критерием Stage 03.

## Итог

Stage 03 закрывает runtime-стабилизацию 3D на активной 3D-first ветке: теперь есть timeout, boundary recovery, WebGL context loss handling, explicit failure reason, retry/reduced mode и отсутствие возврата в legacy из fallback. Следующий логичный этап — Stage 4: сделать fallback не просто сообщением, а рабочим 2D/SVG режимом.
