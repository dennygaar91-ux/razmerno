# Release Roadmap — Размерно

Документ фиксирует последовательность этапов до **Release v1** candidate.

Последняя сверка: `docs/planning/project-reconciliation-report-v1.md` от 2026-06-16; Release v1 scope alignment — `docs/planning/mvp-scope.md` (Release v1 Scope path preserved).

Важно: этот roadmap не запускает новый development scope. Он синхронизирует порядок этапов с фактическим backlog state и Release v1 Scope.

## Release v1 alignment

- Продуктовый объём Release v1 описан в `docs/planning/mvp-scope.md` (legacy path preserved).
- Backlog traceability: `Capability` / `Release Phase` — см. `docs/planning/current-backlog.md` → Release v1 Governance Traceability.
- RPES остаётся primary product/engineering SoT; planning docs не заменяют RPES, а синхронизируются с ним.
- Customer platform, order lifecycle, Operations Workspace, manual B3D и manual payment — обязательные Release v1 tracks, даже если часть implementation evidence ещё open в backlog.

### Release Phase ↔ Roadmap traceability

Decision source: Release v1 governance integration (`docs/planning/current-backlog.md` → Release v1 Governance Traceability).

| Release Phase | Primary roadmap stages | Representative backlog tasks |
|---|---|---|
| RV1-A Constructor Core | R2, R3, R5, R6, R7 | P0-01, P0-02, P0-05, P0-06, P0-16, P0-17, P0-18, M8-P0-02, M8-P0-03, P1-10 |
| RV1-B Pricing & Submit Reliability | R4, R9 | P0-03, P0-11, P0-12, P0-13, M8-P0-01, M8-P0-04, M8-P0-05, P1-09 |
| RV1-C Customer Platform | R9 (post-submit continuity) | P1-27 |
| RV1-D Orders Lifecycle | R12 | P1-28, M9-P1-02 |
| RV1-E Operations Workspace | R12 | P1-28, P2-09, P2-25 |
| RV1-F Production Handoff | R11 | P1-11A, P1-11B, P1-23, P1-24, БАЗИС-Мебельщик Boundary Lock, Production Export Failure Contract |
| RV1-G Payments & Notifications | R12, R13 | P1-28, M8-P0-04, M9-P1-03, API Order Notification Failure Contracts |
| RV1-H Release Candidate | R10, R13 | M8-P1-01, M8-P1-02, M8-P1-05, P1-21, P2-20, P2-21, Live Provider / Supabase Order Flow Verification |

---

## Stage R0 — Planning Reconciliation

Статус: completed / documentation-only.

Цель: привести planning layer к фактическому состоянию после закрытия части P0.

Выполнено:

- обновлён `docs/planning/current-backlog.md`;
- создан `docs/planning/project-reconciliation-report-v1.md`;
- синхронизирован `docs/planning/master-development-plan-v1.md`;
- синхронизирован `docs/planning/release-roadmap.md`.

Результат:

- закрытые, открытые, duplicate и partially covered задачи разведены;
- следующий критический блок определён как Constructor Reset Contract + Constructor State Stabilization.

---

## Stage R1 — Constructor Reset Contract Resolution

Статус: completed with backlog evidence.

Цель: закрыть P0-16.

Задачи:

- явно выбрать и документировать целевой reset contract;
- синхронизировать implementation с выбранным contract;
- убрать конфликт ожиданий между constructor store и smoke tests;
- подтвердить typecheck, build и релевантные constructor tests.

Риски:

- без этого Constructor3D, checkout и fallback могут опираться на нестабильную state-семантику.

Результат:

- `reset()` имеет один подтверждённый смысл;
- P0-16 можно закрыть только после evidence.
- Evidence update: P0-16 is closed on main after PR #66 and closure evidence commit `827b2af7`.

---

## Stage R2 — Constructor Smoke Test / State Model Stabilization

Цель: закрыть P0-17 и стабилизировать P0-02.

Задачи:

- синхронизировать `constructorFlowSmoke.test.ts` с выбранным reset contract;
- проверить constructor store expectations;
- стабилизировать ownership для dimensions, sections, zones, filling, materials, checkout и validation;
- определить, какие state fields являются source of truth.

Риски:

- нельзя параллельно делать Constructor3D UX changes или checkout refactor.

Результат:

- constructor state можно безопасно использовать для 3D, fallback, pricing и checkout.
- Evidence update: P0-17 is closed on main after PR #68 and closure evidence commit `a57e0cab`.

---

## Stage R3 — Constructor3D Architecture Guard Implementation

Цель: закрыть P0-18.

Задачи:

- enforce active Constructor3D boundary;
- запретить случайные legacy imports;
- запретить direct API/Supabase/admin/server imports в активный constructor layer;
- зафиксировать forbidden layer crossings.

Риски:

- guard должен отражать реальную архитектуру после state/reset stabilization.

Результат:

- агенты меньше рискуют случайно вернуть legacy/runtime dependencies в Constructor3D.
- Evidence update: P0-18 is closed on main after PR #64 and closure evidence commit `839c3463`.

---

## Stage R4 — Pricing Golden Fixtures & Client/Server Parity

Цель: закрыть P0-13 и усилить P0-03.

Задачи:

- создать golden fixtures для ключевых сценариев цены;
- проверить client/server parity;
- проверить материалы, кромку, упаковку, доставку и сборку;
- зафиксировать расхождения и источник истины;
- не менять production cost rules параллельно.

Риски:

- pricing audit фиксирует риск разных client/server paths.

Результат:

- цена подтверждена fixture/evidence, а не только audit-выводом.

---

## Stage R5 — Three.js Stability

Цель: закрыть P0-05.

Задачи:

- error boundary;
- loading state;
- камеры;
- reduced quality;
- контроль базовой производительности;
- устойчивость сцены без глубокого визуального redesign.

Риски:

- нельзя одновременно делать deep visual scene rework.

Результат:

- 3D работает как основной интерфейс и не ломает сценарий заявки.

---

## Stage R6 — WebGL / 2D Fallback

Цель: закрыть P0-06.

Задачи:

- fallback при недоступности WebGL;
- 2D preview как рабочий fallback;
- отсутствие блокировки настройки и заявки при сбое 3D;
- базовые fallback tests.

Риски:

- fallback должен использовать стабильную state model.

Результат:

- пользователь может продолжить конфигурацию без WebGL.

---

## Stage R7 — Constructor3D Interaction MVP

Цель: завершить основной сценарий сборки через 3D.

Задачи:

- выбор секций и зон;
- labels;
- локальное меню;
- добавление/удаление наполнения;
- фасады на уровне секции;
- точная настройка фасадов по зонам;
- random preset.

Риски:

- зависит от state model, architecture guard и scene stability.

Результат:

- пользователь может собрать мебель через 3D без legacy-flow.

---

## Stage R8 — Materials MVP

Цель: сделать материалы убедительными и связанными с моделью.

Задачи:

- реальные текстуры;
- swatches;
- zoom-preview;
- синхронизация материала с 3D;
- fallback для 2D;
- material / texture parity tests.

Риски:

- текстуры могут ухудшить производительность;
- material parity зависит от pricing и 3D material pipeline.

Результат:

- материал визуально соответствует выбранному декору.

---

## Stage R9 — Checkout UX + Submit E2E

Цель: завершить заявку на browser/user-flow уровне.

Задачи:

- итоговая смета;
- доставка toggle + адрес;
- сборка toggle;
- контакты;
- согласие;
- success state без reset модели;
- Constructor3D submit E2E.

Риски:

- зависит от pricing parity, state model и reset/no-reset contract.

Результат:

- пользователь может отправить заявку в основном browser flow.

---

## Stage R10 — QA Expansion / Nightly / Release Workflow

Цель: усилить качество после baseline QA gate.

Задачи:

- Nightly QA Workflow;
- Release QA Workflow;
- Fast/Medium/Heavy test separation;
- Istanbul/LCOV coverage;
- Deployment Validation Layer;
- Test Quarantine System.

Риски:

- не менять бизнес-логику ради тестов;
- не ломать package scripts без ownership plan.

Результат:

- проект готов к более крупным production/admin этапам.
- QA maturity policy: `docs/planning/release-qa-maturity-matrix-v1.md`.

---

## Stage R11 — Production Layer MVP

Цель: подготовить производственные данные без перегруза клиента.

Задачи:

- production model;
- panels;
- hardware basics;
- drilling basics;
- warnings;
- ручная технологическая проверка;
- production golden snapshots.

Риски:

- нельзя показывать клиенту сложную производственную логику;
- production cost rules не менять параллельно с pricing parity.

Результат:

- заказ содержит базу для технолога.

---

## Stage R12 — Admin MVP

Цель: дать менеджеру минимальный рабочий **Order Operations Workspace**.

Задачи:

- список заявок;
- карточка заявки;
- контакты;
- состав заказа;
- цена;
- production warnings;
- статус обработки;
- Operations View / audit log baseline;
- admin API/integration tests.

Риски:

- зависит от Supabase/order storage и production layer;
- scope drift в сторону CRM запрещён — workspace, не sales pipeline.

Результат:

- заявки можно обрабатывать вручную в operations workflow.

---

## Stage R13 — Release v1 Candidate

Цель: подготовить Release v1 к запуску.

Задачи:

- финальный QA;
- performance pass;
- security checklist;
- env validation;
- release workflow;
- rollback plan;
- customer cabinet + order lifecycle smoke;
- manual payment + notification center verification.

Риски:

- нельзя добавлять новые крупные функции на этом этапе.

Результат:

- готовность к Release v1 launch по exit criteria из `docs/planning/mvp-scope.md`.

---

## Parallelization Notes

Можно параллельно:

- documentation sync;
- pricing parity analysis/fixtures;
- materials content preparation без изменения Three.js pipeline;
- QA workflow planning без package script mutation;
- production planning docs без runtime changes.

Нельзя параллельно:

- constructor reset/state stabilization + Constructor3D UX changes;
- constructor state model + WebGL fallback implementation;
- pricing parity + production cost rules;
- Three.js stability + deep visual scene rework;
- legacy removal + test migration;
- global CSS cleanup + active constructor UI refactor.
