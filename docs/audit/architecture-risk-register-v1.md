# Architecture Risk Register v1 — Размерно

Статус: COMPLETED.

Дата: 2026-06-14.

Роль: Architecture Guard Agent.

## 0. Scope

Документ фиксирует архитектурные риски после guard audit и Constructor3D dependency map.

Runtime код не изменялся.

## 1. Risk scale

Вероятность:

- Low — маловероятно без явного изменения scope;
- Medium — возможно при обычной работе агента;
- High — вероятно при следующей разработке без guard.

Влияние:

- Low — локальный дефект;
- Medium — усложнение поддержки или QA;
- High — риск MVP/regression;
- Critical — риск потери архитектурного контроля или некорректной цены/заявки.

## 2. P0 risks

### R-001 — Active Constructor3D не защищён dedicated guard

Вероятность: High.

Влияние: Critical.

Слой: Architecture / QA guards.

Описание:

Существующие guards частично защищают historical/simple constructor и legacy quarantine, но не активный путь `Constructor3DPage -> src/static-pages/constructor/**`.

Риск:

Следующие агенты могут случайно внести legacy import, direct pricing logic, direct order/API logic или расширить page до God Component, и текущие checks это не поймают.

Mitigation:

- реализовать `check:constructor3d-guard` по `docs/planning/constructor3d-guard-spec-v1.md`;
- не начинать state/Three.js/checkout refactor до прохождения guard.

### R-002 — Active Constructor3D может импортировать `src/configurator/**`

Вероятность: High.

Влияние: Critical.

Слой: Active constructor / Legacy boundary.

Описание:

`src/configurator/**` остаётся в репозитории как legacy runtime. Dedicated scan, запрещающий active-to-legacy imports, отсутствует.

Риск:

Active Constructor3D может начать зависеть от legacy context/store/model/three. Это создаст смешение state, pricing, validation и scene logic.

Mitigation:

- build-failing rule для imports из `src/configurator/**` в active scope;
- Legacy Migration Agent должен сделать inventory и test ownership map;
- не удалять legacy до переноса тестов и approval.

### R-003 — `check-constructor-architecture` создаёт ложное ощущение защиты

Вероятность: High.

Влияние: High.

Слой: QA / architecture governance.

Описание:

Скрипт с актуально звучащим названием проверяет `ConstructorPage.tsx`, а не `Constructor3DPage.tsx`.

Риск:

Агент может запустить `check:constructor-architecture`, получить зелёный результат и ошибочно считать active Constructor3D защищённым.

Mitigation:

- классифицировать script как historical/simple constructor guard;
- создать QA command map;
- добавить новый `check:constructor3d-guard`.

### R-004 — Orchestration-heavy `Constructor3DPage.tsx`

Вероятность: High.

Влияние: High.

Слой: Page / orchestration.

Описание:

Active page уже связывает state facade, quote, submit, WebGL diagnostics, 3D/2D fallback, drawer, footer, stagebar, scene callbacks.

Риск:

Дальнейшие изменения могут превратить page в God Component, где будет сложно безопасно менять state, checkout, Three.js и UX.

Mitigation:

- guard line thresholds;
- page must stay orchestration-only;
- future decomposition через focused hooks/components после guard.

### R-005 — `useConstructorPageState` как God Facade

Вероятность: High.

Влияние: High.

Слой: State facade.

Описание:

Hook агрегирует большой набор selectors/actions и snapshot fields.

Риск:

Следующие задачи будут расширять один facade вместо выделения domain-specific state hooks. Это увеличит coupling и риск регрессий.

Mitigation:

- State Agent только после guard + legacy inventory + QA map;
- warning threshold на breadth;
- план выделения focused hooks: sizes, filling, materials, checkout, scene, validation.

### R-006 — Несколько state models существуют одновременно

Вероятность: High.

Влияние: Critical.

Слой: State / legacy.

Описание:

В проекте одновременно существуют active constructor store, legacy config provider/reducer/store/bridge и tests вокруг legacy state.

Риск:

Агент может взять старую state model как source of truth.

Mitigation:

- import ban active -> `src/configurator/**`;
- legacy inventory;
- state source-of-truth document before state refactor.

### R-007 — Несколько pricing путей

Вероятность: Medium.

Влияние: Critical.

Слой: Pricing.

Описание:

Planning требует точную цену и единый source-of-truth. Legacy context/pricing paths ещё существуют в репозитории.

Риск:

UI может начать показывать цену из неправильного источника или расходиться с server recalculation.

Mitigation:

- page must use `useConstructorQuote` only;
- guard against direct pricing formula imports in page;
- Pricing Agent отдельным scope после architecture guard.

### R-008 — Checkout/order flow может быть обойдён direct API call

Вероятность: Medium.

Влияние: Critical.

Слой: Checkout / order.

Описание:

Active page уже подключает `useConstructorSubmit`; без guard будущий компонент может начать делать submit напрямую.

Риск:

Можно сломать обязательные поля, cooldown, consent, server validation, PII constraints.

Mitigation:

- guard: no direct `api/**`, no direct Supabase in page/components/store;
- submit только через approved hook/adapter.

### R-009 — Three.js layer может смешаться с checkout/pricing/state refactor

Вероятность: Medium.

Влияние: High.

Слой: Three.js / scene runtime.

Описание:

3D открыт по умолчанию, но стабильность/fallback важнее deep visual rewrite. Scene получает callbacks и input сверху.

Риск:

Three.js agent может начать менять state/pricing/checkout из scene layer или совмещать architecture refactor с visual redesign.

Mitigation:

- guard: three layer cannot import pricing/submit/API/Supabase;
- follow parallelization rule: stability first, visual quality later.

### R-010 — Legacy routes остаются explicit и могут быть восприняты как active

Вероятность: Medium.

Влияние: High.

Слой: Routing / legacy quarantine.

Описание:

Legacy routes `/constructor-legacy` и `/configurator-legacy` существуют явно.

Риск:

Агент может доработать legacy route вместо active Constructor3D.

Mitigation:

- keep explicit quarantine docs;
- Legacy Migration Agent inventory;
- no feature development in `ConstructorPage.tsx`.

## 3. P1 risks

### R-011 — Package scripts смешивают historical и current stages

Вероятность: High.

Влияние: Medium.

Слой: QA / governance.

Описание:

`package.json` содержит много stage families: stage3-stage27, stage-n, stage-q, stage03-stage19, production/admin/release scripts.

Риск:

Агенты могут запускать не те checks или следовать старой stage-линии.

Mitigation:

- QA / Build Agent должен создать `docs/planning/qa-command-map-v1.md`;
- пометить current / historical / legacy / release scripts.

### R-012 — Historical bridge guards закрепляют legacy как активную область

Вероятность: Medium.

Влияние: Medium.

Слой: Legacy / QA.

Описание:

`check-stage20-config-bridge.mjs` проверяет legacy config bridge.

Риск:

Без классификации агент может продолжить развивать bridge вместо миграции.

Mitigation:

- classify as historical legacy bridge guard;
- Legacy Migration Agent должен определить, какие bridge tests переносить.

### R-013 — CSS ownership не защищён

Вероятность: Medium.

Влияние: Medium.

Слой: CSS / UI architecture.

Описание:

Global CSS подключён широко, включая constructor CSS layers.

Риск:

Будущие UI changes могут сломать active constructor или legacy визуал cross-scope.

Mitigation:

- не делать global CSS cleanup параллельно active constructor refactor;
- отдельный CSS ownership audit после architecture/state stabilization.

### R-014 — Adapter boundary может быть обойдён

Вероятность: Medium.

Влияние: High.

Слой: Adapters / contracts.

Описание:

Adapters должны быть границей между UI state и quote/order/production preview contracts.

Риск:

Payload/quote/order shape начнут собирать вручную в page/components.

Mitigation:

- guard against direct order/API logic;
- State/Checkout/Pricing agents должны работать через adapters.

### R-015 — Production model может попасть в client UI logic

Вероятность: Medium.

Влияние: High.

Слой: Production / client UI.

Описание:

Production layer нужен для технолога/admin, но сложная production logic не должна перегружать клиентский UI.

Риск:

Constructor UI начнёт мутировать production model или показывать сложные технологические warnings клиенту.

Mitigation:

- guard no direct production mutation imports in active page/components;
- production preview только через approved adapter.

## 4. P2 risks

### R-016 — Documentation noise remains high

Вероятность: High.

Влияние: Medium.

Слой: Docs / planning.

Описание:

В проекте много исторических docs/reports. Это полезно как история, но мешает агентам быстро находить current truth.

Риск:

Агенты будут опираться на устаревшие документы.

Mitigation:

- keep current planning docs as source of truth;
- add docs index / current-vs-history map.

### R-017 — QA cost may become too high

Вероятность: Medium.

Влияние: Medium.

Слой: QA / CI.

Описание:

`qa:all` очень широкий и может быть непрактичен для каждого небольшого этапа.

Риск:

Агенты начнут пропускать проверки или запускать слишком много unrelated checks.

Mitigation:

- QA command map;
- task-type-specific minimal gates.

### R-018 — File thresholds can create false failures if introduced too aggressively

Вероятность: Medium.

Влияние: Medium.

Слой: Architecture guard.

Описание:

Если сразу hard-fail на все большие files, можно заблокировать работу до decomposition.

Риск:

Guard будет мешать стабилизации вместо защиты.

Mitigation:

- staged thresholds: hard fail only on critical imports and page hard limit;
- breadth warnings for store/facade initially.

## 5. P3 / Post-MVP risks

### R-019 — Scope creep into AI/B2B/kitchens/cinematic/Basis automation

Вероятность: Medium.

Влияние: High.

Слой: Product scope.

Описание:

Post-MVP features уже известны, но не должны попадать в обязательный MVP.

Риск:

Команда потеряет фокус на стабилизации Constructor3D, pricing, checkout, fallback и release readiness.

Mitigation:

- follow `master-development-plan-v1.md` P3 backlog;
- agents must stop and document if task pulls P3 into MVP.

## 6. Current stop rules

Агент обязан остановиться и зафиксировать риск, если задача требует:

- изменения pricing formula вне Pricing Agent scope;
- изменения checkout/order contract вне Checkout Agent scope;
- изменения API/Supabase вне explicit backend scope;
- удаления legacy до migration/test ownership;
- Three.js visual rewrite одновременно со state refactor;
- production cost rules одновременно с pricing changes;
- global CSS cleanup параллельно active constructor UI refactor.

## 7. Recommended agent sequence

### Обязательный следующий агент

Architecture Guard Implementation Agent.

Задача:

- реализовать scripts-only guard по `constructor3d-guard-spec-v1.md`;
- не менять runtime;
- не менять package scripts без явного scope.

### Можно параллельно

QA / Build Agent:

- `docs/planning/qa-command-map-v1.md`;
- классификация scripts.

Legacy Migration Agent:

- inventory `src/configurator/**`;
- tests ownership map;
- migration dependencies.

### Должны ждать guard implementation

- Constructor State Agent;
- Pricing Agent;
- Three.js Stability Agent;
- Constructor UX Agent;
- Checkout Agent.

## 8. Backlog additions

Добавить в backlog:

1. Implement Constructor3D architecture guard.
2. Create QA command map: current vs historical scripts.
3. Legacy runtime inventory and test ownership map.
4. Focused state hook split plan for `useConstructorPageState`.
5. Pricing source-of-truth audit after guard.
6. Checkout contract audit after state boundary.
7. CSS ownership audit after constructor architecture stabilization.

## 9. Conclusion

Главный текущий риск — не отсутствие функционала, а отсутствие build-failing архитектурных границ для active Constructor3D. Guard spec готова; следующий безопасный шаг — scripts-only implementation.