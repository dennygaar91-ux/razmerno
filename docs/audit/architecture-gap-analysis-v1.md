# Architecture Gap Analysis v1 — Размерно

Статус: docs-only архитектурный аудит текущего состояния репозитория относительно `docs/planning/**`.
Дата: 2026-06-14.
Роль: Lead Architect.

## 0. Scope и ограничения

В рамках задачи выполнен только аудит и создан этот документ.

Не выполнялось:

- новый функционал;
- редизайн;
- изменение pricing;
- изменение checkout;
- изменение Three.js runtime;
- изменение API;
- изменение Supabase;
- изменение production layer;
- изменение admin;
- рефакторинг исходного кода.

Изменён только файл:

- `docs/audit/architecture-gap-analysis-v1.md`.

Проверки сборки не запускались, потому что задача docs-only и исходный код не менялся.

## 1. Документы, относительно которых проводилась сверка

Обязательные planning / audit / agent документы:

- `docs/planning/README.md`
- `docs/planning/master-development-plan-v1.md`
- `docs/planning/current-backlog.md`
- `docs/planning/mvp-scope.md`
- `docs/planning/architecture-decisions.md`
- `docs/planning/agent-workflow.md`
- `docs/planning/parallelization-rules.md`
- `docs/planning/release-roadmap.md`
- `docs/audit/documentation-audit-v1.md`
- `docs/audit/architecture-audit-v1.md`
- `docs/agent/architect-rules.md`

Ключевая управляющая линия из planning:

- стратегия: `Stabilize → Complete → Harden → Release`;
- активный путь: новый `Constructor3D`;
- legacy Constructor должен находиться в quarantine;
- нельзя случайно импортировать legacy в новую архитектуру;
- сначала стабилизировать архитектурные границы и state model, затем pricing, Three.js, interactions, materials, checkout, testing, production/admin;
- pricing должен оставаться точным и не должен расходиться между UI, server и production layer;
- checkout остаётся внутри конструктора;
- 3D открыт по умолчанию, 2D/WebGL fallback обязателен;
- P3/post-MVP функции не должны втягиваться в обязательный MVP.

## 2. Проверенные зоны репозитория

Были просмотрены ключевые файлы и зоны:

- `package.json`
- `src/App.tsx`
- `src/main.tsx`
- `src/static-pages/Constructor3DPage.tsx`
- `src/static-pages/ConstructorPage.tsx`
- `src/static-pages/constructor/**`
- `src/static-pages/constructor/store/**`
- `src/static-pages/constructor/hooks/**`
- `src/static-pages/constructor/three/**`
- `src/configurator/**`
- `scripts/check-legacy-runtime-imports.mjs`
- `scripts/check-constructor-architecture.mjs`
- `scripts/check-stage19-legacy-cleanup.mjs`
- `scripts/check-stage20-config-bridge.mjs`

## 3. Executive Summary

Текущее состояние лучше, чем описано в раннем `architecture-audit-v1.md` по части отдельных God-файлов: `src/static-pages/constructor/store/constructorStore.ts` уже не является физическим монолитом на 1600+ строк, а стал композиционным entrypoint, который собирает slices. `src/static-pages/constructor/rules/projectRules.ts` также уже выглядит как barrel-export, а не огромный файл с правилами.

Но общий архитектурный риск сохраняется. Основные отклонения от roadmap сейчас не в одном конкретном файле, а в параллельном существовании нескольких архитектурных эпох:

1. `Constructor3DPage` является активным маршрутом, но рядом остаётся `ConstructorPage` как явная legacy-route.
2. `src/configurator/**` всё ещё содержит старую модель, reducer, context, pricing wrapper, validation и tests.
3. Часть `package.json` и QA-guards всё ещё активно проверяет старую `src/configurator/**` ветку.
4. Существуют два разных constructor-семейства: новый `src/static-pages/constructor/**` и старый `src/configurator/**`.
5. Существуют несколько state-подходов: новый `useConstructorStore`, старый `ConfigProvider/useReducer`, legacy `configStore` и bridge-механика.
6. Существуют несколько pricing-подходов: новый quote/production preview path и legacy `calculatePrice` через `src/shared/lib/price` внутри `src/configurator/context.tsx`.
7. CSS остаётся глобально подключённым в `src/main.tsx`, включая большие `constructor.css` и `constructor3d.css`, что ухудшает слойность и изоляцию.
8. Часть architecture checks устарела: `scripts/check-constructor-architecture.mjs` проверяет старый `ConstructorPage.tsx`, хотя planning фиксирует `Constructor3D` как активный путь.

Итог: проект находится не в состоянии «полностью хаотичного монолита», а в состоянии частично проведённой миграции. Главный риск — агенты могут принять переходные legacy-модули за актуальный источник истины и продолжить развивать не тот слой.

## 4. Найденные архитектурные отклонения от roadmap

### GAP-01 — Legacy Constructor всё ещё имеет явные маршруты

Приоритет: P0.

Факт:

- `src/App.tsx` направляет `/configurator`, `/constructor`, `/constructor.html`, `/configurator-3d`, `/constructor-3d`, `/constructor3d` на `LazyConstructor3DPage`.
- Но `/constructor-legacy` и `/configurator-legacy` направляются на `LazyConstructorPage`.

Почему это отклонение:

Planning требует, чтобы старый Constructor был quarantine, а активная ветка была Constructor3D. Явные legacy-route допустимы только как временная техническая зона, но они должны быть описаны как quarantine и защищены от развития.

Риск невыполнения:

Агенты или тесты могут продолжить дорабатывать `ConstructorPage` вместо `Constructor3DPage`. Это ведёт к расслоению UI, checkout, state и validation.

Рекомендация:

- Не удалять legacy-route немедленно.
- Добавить архитектурную карту маршрутов в docs.
- Ввести правило: любые изменения `src/static-pages/ConstructorPage.tsx` допустимы только как legacy quarantine / test migration.
- Следующим агентам сначала проверить, какие tests ещё требуют legacy-route.

Можно выполнять независимо: частично. Требует координации с test migration.

---

### GAP-02 — QA/architecture guards частично смотрят на старую архитектуру

Приоритет: P0.

Факт:

- `scripts/check-constructor-architecture.mjs` проверяет `src/static-pages/ConstructorPage.tsx`, `ConstructorSidebar`, `ConstructorScene`, `ConstructorStepPanel` и лимитирует `ConstructorPage.tsx` до 220 строк.
- Но planning и roadmap фиксируют активный путь как `Constructor3D`.

Почему это отклонение:

Quality gate должен защищать текущую целевую архитектуру. Сейчас часть guard-логики может давать ложное ощущение архитектурной защищённости, проверяя legacy/предыдущую desktop-ветку, а не основной `Constructor3DPage`.

Риск невыполнения:

Проект может пройти `check:constructor-architecture`, даже если активный `Constructor3DPage` начнёт разрастаться или нарушать слои.

Рекомендация:

- Создать новый guard для `Constructor3D` архитектуры.
- Старый `check-constructor-architecture.mjs` переименовать концептуально в legacy/simple constructor guard или пометить как historical.
- Проверять в новом guard: запрет прямого rendering крупных step components в `Constructor3DPage`, лимиты props, отсутствие imports из `src/configurator/**`, отсутствие pricing/order/api logic внутри page component.

Можно выполнять независимо: да, как docs/scripts task без изменения runtime.

---

### GAP-03 — Roadmap говорит Stage 02–03, но package scripts уже содержат Stage 20+ bridge tasks

Приоритет: P1.

Факт:

`package.json` содержит длинную историю stage scripts: `stage20`, `stage21`, `stage22`, `stage23`, `stage24`, `stage25`, `stage26`, `stage27`, `stage-n*`, `stage-q*`, `stage03-*` и т.д. При этом planning roadmap заново фиксирует последовательность до MVP от Stage 01 до Stage 12.

Почему это отклонение:

В репозитории смешались исторические stage-линии и новая planning-линия. Это создаёт когнитивный конфликт: агент может считать stage20/stage27 актуальным порядком работ, хотя текущий управляющий roadmap другой.

Риск невыполнения:

Новые агенты будут запускать или читать не те checks, путать historical stages с текущими release stages и делать задачи вне текущей очередности.

Рекомендация:

- Сделать `docs/planning/qa-command-map.md` или раздел в planning README.
- Разделить scripts на current quality gates и historical stage checks.
- Не удалять scripts до отдельного QA-аудита.

Можно выполнять независимо: да, как documentation / QA governance task.

---

### GAP-04 — Production/Admin уже широко представлены в scripts при том, что текущий roadmap требует сначала constructor/state/pricing/Three.js

Приоритет: P1.

Факт:

`package.json` содержит множество `qa:stage3`, `qa:stage4`, `qa:stage5`, `qa:stage6`, `qa:stage7`, `qa:stage8`, `qa:stage9`, `qa:stage13`–`qa:stage18`, связанных с admin, Supabase, production, deploy, Basis documents, email attachments.

Почему это отклонение:

Planning допускает production/admin как MVP-часть, но release-roadmap ставит их после constructor, state, pricing, Three.js, checkout и testing. Сейчас scripts выглядят так, будто production/admin уже были активно развернуты в прошлой stage-линии.

Риск невыполнения:

Агенты могут уйти в production/admin hardening раньше стабилизации constructor state и pricing, что прямо нарушает `parallelization-rules.md`.

Рекомендация:

- Не удалять production/admin scripts.
- В planning явно пометить их как existing previous-stage artifacts.
- Для ближайших агентов использовать только релевантные checks по текущему scope.

Можно выполнять независимо: да, но только docs/QA map.

## 5. Дублирование логики

### DUP-01 — Две constructor families

Приоритет: P0.

Факт:

- Новый активный путь: `src/static-pages/Constructor3DPage.tsx` + `src/static-pages/constructor/**`.
- Старый/переходный путь: `src/static-pages/ConstructorPage.tsx`.
- Legacy runtime: `src/configurator/**`.

Риск:

Три уровня constructor-кода создают риск, что изменения попадут в неправильную ветку.

Рекомендация:

- Ввести explicit ownership:
  - `Constructor3DPage` — active MVP path.
  - `ConstructorPage` — legacy/simple route, no feature development.
  - `src/configurator/**` — test-backed legacy quarantine.
- Любой новый constructor feature запрещать вне `src/static-pages/constructor/**`.

---

### DUP-02 — Дубли state model: `useConstructorStore`, legacy `ConfigProvider`, legacy `configStore`, bridge

Приоритет: P0.

Факт:

- Новый `useConstructorStore` собирается из slices.
- Старый `src/configurator/context.tsx` содержит `ConfigState`, `configReducer`, `ConfigProvider`, validation и pricing wrapper.
- `src/configurator/store/configStore.ts` содержит отдельный Zustand store.
- `src/configurator/state/configReducer.ts` пока импортирует reducer из `../context`.

Риск:

State changes могут быть внесены в legacy reducer/context вместо нового canonical constructor state. Это особенно опасно для dimensions, sections, zones, filling, checkout и validation.

Рекомендация:

- Следующим агентам не использовать `src/configurator/context.tsx` как источник истины.
- Создать migration checklist: какие tests ещё читают legacy state.
- Закрывать bridge постепенно, начиная с read-tests, затем action-tests, затем route dependency.

---

### DUP-03 — Дубли pricing helpers

Приоритет: P0.

Факт:

- Новый constructor использует `useConstructorQuote` и snapshot path.
- Legacy `src/configurator/context.tsx` содержит `calculatePrice(s: ConfigState)` и вызывает `calculatePrice` из `src/shared/lib/price`.
- В старом audit уже зафиксированы дополнительные pricing helpers: `src/pricing/**`, `src/constructor/pricing.ts`, `src/constructor/quickEstimate.ts`, adapters и shared price helper.

Риск:

Цена может начать отличаться между активным Constructor3D, legacy route, server/API и production preview.

Рекомендация:

- Не менять pricing в рамках architecture cleanup.
- Отдельным Pricing Agent провести source-of-truth audit.
- Ввести правило: UI не рассчитывает окончательную стоимость локальными legacy formula helpers, а получает согласованный quote path.

---

### DUP-04 — Дубли validation/warning semantics

Приоритет: P1.

Факт:

- Новый constructor имеет `ConstructorValidationState` и issues с `blocksCheckout`.
- Legacy `src/configurator/context.tsx` содержит `ValidationMessage`, `validate`, `hasErrors`, `getStepStatuses`, `firstErrorStep`.

Риск:

Разные warning/error модели могут блокировать заявку по-разному.

Рекомендация:

- Для MVP считать новой моделью только validation из `src/static-pages/constructor/**`.
- Legacy validation оставить только для миграции tests.
- Создать bridge-test, который фиксирует, что active route не зависит от legacy validation.

---

### DUP-05 — Дубли Three.js / viewer / fallback families

Приоритет: P1.

Факт:

- Новый 3D path: `src/static-pages/constructor/three/**`, `LazyThreeFurnitureViewer`, `TwoDFallbackScene`.
- Legacy tests и scripts всё ещё указывают на `src/configurator/three/**`.

Риск:

Three.js fixes могут быть внесены в legacy viewer, а не в активную 3D-first сцену.

Рекомендация:

- Любые Three.js изменения делать только в `src/static-pages/constructor/three/**`.
- Legacy `src/configurator/three/**` держать read-only до удаления.
- Обновить check scripts так, чтобы они явно различали active viewer и legacy viewer.

## 6. God Components

### GOD-COMP-01 — `src/static-pages/Constructor3DPage.tsx`

Приоритет: P0/P1.

Текущее состояние:

Файл уже значительно меньше исторических 2700+ строк, но всё ещё является orchestration-heavy page component. В нём одновременно находятся:

- WebGL diagnostics state;
- scene render mode;
- fallback switching;
- reset dialog state;
- active add target state;
- получение большого набора state/actions из `useConstructorPageState`;
- quote integration;
- submit integration;
- checkout blocking logic;
- primary action logic;
- Three.js input adapter object;
- toolbar/render switch UI;
- scene runtime rendering.

Риск:

Даже если файл уже не огромный, он остаётся central orchestrator с большим количеством связей. Любая правка может затронуть state, checkout, quote, fallback и scene.

Рекомендация:

- Не рефакторить прямо сейчас без отдельного scope.
- Следующий safe decomposition:
  1. `useConstructor3DRuntimeState` для WebGL/quality/fallback/retry state.
  2. `useConstructorCheckoutGuard` для blocking issues / required fields / submit disabled.
  3. `useThreeFurnitureInput` для `threeInput` adapter.
  4. `Constructor3DScenePanel` для toolbar + runtime status + viewport.

Можно выполнять независимо: частично. Лучше после state guard.

---

### GOD-COMP-02 — `src/static-pages/ConstructorPage.tsx`

Приоритет: P1.

Текущее состояние:

Этот файл уже не активный primary route, но содержит много orchestration для старого/simple constructor path: quote, submit, production preview, validation focus, checkout layout, sidebar, scene.

Риск:

Пока есть `/constructor-legacy`, файл может восприниматься как актуальный constructor implementation.

Рекомендация:

- Не развивать.
- Пометить как legacy route в комментарии/документации.
- Не удалять до миграции tests.

---

### GOD-COMP-03 — `src/configurator/context.tsx`

Приоритет: P0.

Текущее состояние:

Файл смешивает:

- types;
- initial state;
- layout compatibility;
- reducer;
- pricing wrapper;
- validation;
- step statuses;
- React Context provider;
- dynamic bridge to Zustand store;
- exported `STEPS`.

Риск:

Это наиболее опасный legacy God Component / God Module, потому что он выглядит как полноценный источник доменной логики.

Рекомендация:

- Считать quarantine.
- Не импортировать в новую архитектуру.
- Сначала вынести tests с него на active constructor state, потом удалить/архивировать.

## 7. God Stores

### GOD-STORE-01 — `ConstructorStoreState` остаётся God Interface, хотя implementation уже sliced

Приоритет: P0/P1.

Текущее состояние:

`src/static-pages/constructor/store/constructorStore.ts` уже собран из slices, что является хорошим прогрессом. Но `ConstructorStoreState` всё ещё содержит все домены в одном интерфейсе:

- step;
- furniture;
- dimensions;
- sections;
- selected section/zone;
- compartments;
- filling;
- facades;
- materials;
- validation;
- legacy global counters;
- exact mode;
- scene modes;
- production snapshot;
- checkout/contact/consent;
- actions всех доменов.

Риск:

Даже при sliced implementation типовая поверхность остаётся монолитной. Компоненты легко начинают зависеть от слишком широкого API.

Рекомендация:

- Сохранить public API временно.
- Ввести domain-level selectors files или namespace selectors: `dimensionsSelectors`, `layoutSelectors`, `fillingSelectors`, `checkoutSelectors`, `sceneSelectors`.
- Запретить новым компонентам импортировать широкие selectors без необходимости.
- Постепенно разделить `ConstructorStoreState` на пересекающиеся interfaces и собрать root type из них.

---

### GOD-STORE-02 — `useConstructorPageState` как Super Selector Hook

Приоритет: P1.

Текущее состояние:

`useConstructorPageState` читает десятки selectors и возвращает массивный объект `values/actions`. Это снижает прямую связанность page component со store, но сам hook стал центральной точкой агрегации почти всего constructor state.

Риск:

Любой новый UI может просто расширять этот hook, превращая его в God Facade. Это приведёт к лишним re-renders и большой props-поверхности.

Рекомендация:

- Не расширять `useConstructorPageState` без необходимости.
- Для новых частей Constructor3D делать специализированные hooks:
  - `useConstructorDimensionsState`
  - `useConstructorFillingState`
  - `useConstructorMaterialsState`
  - `useConstructorCheckoutState`
  - `useConstructorSceneState`

## 8. Нарушения слоёв

### LAYER-01 — Page layer управляет runtime, quote, checkout и scene adapter одновременно

Приоритет: P1.

Факт:

`Constructor3DPage.tsx` связывает WebGL runtime, quote, submit, checkout blocking, state snapshot и Three.js input.

Риск:

Page component становится местом, где случайно смешиваются UI decisions и domain/runtime decisions.

Рекомендация:

Выделять orchestration hooks без изменения поведения.

---

### LAYER-02 — Legacy `context.tsx` содержит UI-context, pricing и validation в одном файле

Приоритет: P0.

Факт:

`src/configurator/context.tsx` импортирует data, shared price helper, limits config, layout model и одновременно реализует Context provider.

Риск:

Это прямое нарушение разделения UI/state/domain. Особенно опасно, если новый код начнёт импортировать оттуда validation или pricing.

Рекомендация:

Запретить imports из `src/configurator/context.tsx` вне legacy tests/legacy route.

---

### LAYER-03 — Global CSS подключается на app entrypoint

Приоритет: P1/P2.

Факт:

`src/main.tsx` подключает `constructor.css` и `constructor3d.css` глобально.

Риск:

Стили конструктора влияют на весь app scope. Это мешает изоляции страниц, затрудняет cleanup и может ломать landing/info/admin UI.

Рекомендация:

- Не делать глобальный CSS cleanup сейчас.
- На следующих этапах переводить constructor styles в scoped modules/chunks по блокам: shell, drawer, scene, forms, checkout.
- До визуального QA не удалять старые selectors.

---

### LAYER-04 — Test scripts завязаны на runtime legacy modules

Приоритет: P1.

Факт:

Многие `package.json` scripts запускают тесты из `src/configurator/model/**`, `src/configurator/store/**`, `src/configurator/three/**`.

Риск:

Тестовая база закрепляет legacy как «живой» слой.

Рекомендация:

- Составить список tests, которые ещё обязаны читать legacy.
- Перенести critical tests на active constructor state/three path.
- После этого удалить legacy checks из core QA.

## 9. Legacy-зависимости

### LEGACY-01 — `src/configurator/**`

Приоритет: P0.

Статус:

Test-backed quarantine, но не удалён.

Содержит:

- legacy model;
- legacy reducer/context;
- legacy store/bridge;
- legacy Three.js tests;
- legacy layout model;
- legacy validation;
- legacy pricing wrapper.

Рекомендация:

- Не менять как active product code.
- Использовать только для migration tests.
- Ввести explicit `docs/legacy/LEGACY_RUNTIME_MAP.md`, если его ещё нет или если текущий document недостаточен.

---

### LEGACY-02 — Deprecated modules list в `check-legacy-runtime-imports.mjs` неполный

Приоритет: P1.

Факт:

Скрипт проверяет deprecated modules из `src/constructor/**`, но не запрещает широкий импорт из `src/configurator/**` в active constructor.

Риск:

Можно случайно импортировать `src/configurator/context.tsx`, `src/configurator/model/**` или `src/configurator/three/**` в новый код и check может это не поймать.

Рекомендация:

- Расширить guard: active runtime path `src/static-pages/constructor/**` не должен импортировать `src/configurator/**`.
- Исключения разрешать только в tests или explicit migration scripts.

---

### LEGACY-03 — Historical stage scripts засоряют package.json

Приоритет: P2.

Факт:

`package.json` содержит очень много stage scripts разных эпох.

Риск:

Сложно понять, какие проверки являются обязательными для текущего MVP roadmap.

Рекомендация:

- Не удалять без QA owner.
- Добавить docs map: `current`, `legacy`, `historical`, `release-only`.

## 10. Опасные импорты / import risks

### IMPORT-01 — Direct imports из `src/configurator/context.tsx`

Приоритет: P0.

Опасность:

Этот файл содержит legacy state, reducer, pricing, validation и provider. Любой импорт оттуда в новую ветку создаст сильное нарушение слоёв.

Правило:

Запрещено импортировать `src/configurator/context.tsx` из `src/static-pages/constructor/**`, `api/**`, `src/pricing/**`, `src/constructor/**`.

---

### IMPORT-02 — Imports из `src/shared/lib/price.ts` для финальной цены в UI

Приоритет: P0/P1.

Опасность:

Если UI начнёт считать финальную цену через shared helper в обход согласованного quote/pricing engine/server path, возникнет расхождение pricing.

Правило:

Финальная цена должна идти через approved pricing engine / quote flow. Shared helper можно использовать только если он подтверждён как часть source of truth.

---

### IMPORT-03 — Imports из legacy Three.js viewer

Приоритет: P1.

Опасность:

`src/configurator/three/**` не должен попадать в active Constructor3D runtime.

Правило:

Active Three.js path: `src/static-pages/constructor/three/**`.

---

### IMPORT-04 — Imports из deprecated `src/constructor/*.ts` modules

Приоритет: P1.

Опасность:

`check-legacy-runtime-imports.mjs` уже перечисляет deprecated modules: `src/constructor/api.ts`, `legacyGeometry.ts`, `payload.ts`, `basisAdapter.ts`, `pricing.ts`, `productionModel.ts`, `quickEstimate.ts`, `rules.ts`, `basis/manualExport.ts`, `drillingTemplates.ts`.

Правило:

Не использовать эти модули в runtime. Если они нужны, сначала провести отдельный migration review.

## 11. Список проблем по приоритетам

## P0 — блокирует безопасный MVP / работу агентов

1. Legacy Constructor всё ещё доступен через explicit routes.
2. `src/configurator/context.tsx` остаётся опасным God Module с state + pricing + validation + context.
3. State model всё ещё имеет широкий root interface и legacy bridge рядом.
4. Pricing helpers существуют в нескольких слоях; legacy price wrapper остаётся в `context.tsx`.
5. Architecture guard не защищает активный `Constructor3DPage` в достаточной степени.
6. Запрет legacy imports не покрывает весь риск `src/configurator/**` → active constructor.

## P1 — высокий риск качества MVP

1. `Constructor3DPage.tsx` остаётся orchestration-heavy page component.
2. `useConstructorPageState` стал God Facade для всего constructor state.
3. Test scripts всё ещё закрепляют legacy modules.
4. Global CSS constructor files подключены на app entrypoint.
5. Three.js adapter всё ещё выполняет много обязанностей, хотя уже частично разнесён.
6. Historical scripts конфликтуют с новой planning-нумерацией.

## P2 — production-ready / maintainability

1. `package.json` перегружен историческими scripts.
2. Нужна карта current QA commands.
3. Нужно архивировать/пометить старые stage-документы и checks.
4. Нужна постепенная CSS-модульность без глобального cleanup.
5. Нужна документация API contracts, но без изменения API в текущей задаче.

## P3 — post-MVP / later

1. Feature-based architecture migration.
2. Полное удаление legacy после миграции тестов.
3. Глубокая Three.js optimization.
4. Полноценная CAD-like 2D архитектура.
5. Автоматическая `.b3d` generation и глубокая Basis automation.

## 12. Рекомендации для следующих агентов

### Agent A — Architecture Guard Agent

Scope:

- docs/scripts only;
- не менять runtime;
- создать/обновить guard, который проверяет именно active `Constructor3D` architecture.

Задачи:

1. Проверить, что `src/static-pages/constructor/**` не импортирует `src/configurator/**`.
2. Проверить, что `Constructor3DPage.tsx` не содержит pricing implementation, API calls или production mutation logic напрямую.
3. Проверить, что `Constructor3DPage.tsx` остаётся orchestration-only и не рендерит крупные step blocks inline.
4. Обновить docs с current architecture boundaries.

Не делать:

- не удалять legacy;
- не менять checkout;
- не менять pricing;
- не менять Three.js visuals.

---

### Agent B — Legacy Migration Map Agent

Scope:

- docs-only сначала;
- затем tests-only при отдельном разрешении.

Задачи:

1. Составить карту всех tests/scripts, которые завязаны на `src/configurator/**`.
2. Разделить их на:
   - still required;
   - migration candidate;
   - historical only;
   - safe to remove later.
3. Описать порядок удаления legacy без потери coverage.

Не делать:

- не удалять legacy-код сразу;
- не переписывать tests без отдельного этапа.

---

### Agent C — Constructor State Boundary Agent

Scope:

- архитектурный plan first;
- implementation только после отдельного approval.

Задачи:

1. Разделить `ConstructorStoreState` на domain interfaces.
2. Разделить selectors по доменам.
3. Снизить роль `useConstructorPageState` как super-hook.
4. Сохранить публичный API или сделать migration shim.

Не делать:

- не менять behavior;
- не менять pricing/checkout;
- не менять production snapshot semantics.

---

### Agent D — Pricing Source-of-Truth Agent

Scope:

- audit first;
- tests second;
- implementation только после отдельного разрешения.

Задачи:

1. Найти все price helpers.
2. Классифицировать source-of-truth / legacy / preview / formatting.
3. Проверить, что active Constructor3D quote не расходится с server/API pricing.
4. Подготовить migration plan для legacy price wrappers.

Не делать:

- не менять формулы в рамках architecture cleanup.

---

### Agent E — CSS Scope Agent

Scope:

- inventory first;
- no global cleanup.

Задачи:

1. Разделить constructor CSS по ownership map.
2. Пометить selectors: active 3D, legacy simple constructor, landing/info/admin, historical.
3. Только после visual QA переносить стили в scoped files.

Не делать:

- не удалять CSS массово;
- не менять visual design без отдельного задания.

## 13. Stop Rules для следующих агентов

Агент должен остановиться и зафиксировать риск, если задача требует:

- изменения pricing formula;
- изменения checkout submit/order flow;
- изменения API contracts;
- изменения Supabase schema/RLS;
- изменения production model;
- удаления legacy route/code;
- массового CSS cleanup;
- Three.js visual rewrite вместо stability work.

## 14. Итоговая оценка

Архитектура проекта находится в переходном состоянии: активный `Constructor3D` уже закреплён в маршрутах, часть старых God-файлов уже декомпозирована, но legacy runtime и historical QA ecosystem продолжают влиять на проект.

Главная задача ближайших архитектурных этапов — не писать новый функционал, а поставить защитные границы:

1. active path guard;
2. legacy import ban;
3. state/domain boundaries;
4. pricing source-of-truth map;
5. tests migration map;
6. current QA command map.

Без этих шагов следующие агенты будут продолжать работать в условиях неоднозначности и могут случайно усиливать legacy вместо движения по roadmap.
