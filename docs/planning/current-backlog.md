# Current Backlog — Размерно

Статус: единый operational backlog для агентов.

Этот документ является **единственным источником истины по активным backlog-задачам**. Временные backlog-followup документы после переноса задач должны архивироваться или удаляться из active planning layer.

Последняя сверка: `docs/planning/project-reconciliation-report-v1.md`.

Формат приоритета:

- P0 — блокирует безопасный MVP.
- P1 — требуется для качественного MVP.
- P2 — усиливает production-ready уровень.
- P3 — post-MVP.

Формат статуса:

- `open` — актуально, не закрыто.
- `in progress` — частично сделано, но closure conditions не выполнены.
- `closed` — закрыто и подтверждено документальным evidence.
- `obsolete` — потеряло актуальность.
- `duplicate` — перекрыто другой задачей и не должно запускаться отдельно.

---

## P0 — Critical MVP Safety

### P0-01 Unified Constructor Architecture

Статус: open.

Зачем: зафиксировать Constructor3D как активную ветку, а legacy Constructor — как quarantine.

Риск: агенты будут менять старый код или дублировать логику.

Объём: XL. Зависимости: architecture audit. Независимо: нет.

### P0-02 Constructor State Model Stabilization

Статус: open.

Зачем: единая модель данных для размеров, секций, зон, наполнения, фасадов, материалов, checkout и validation.

Риск: ломается связь UI, 3D, fallback, pricing и checkout.

Объём: L. Зависимости: P0-01. Независимо: нет.

### P0-03 Pricing Engine Validation

Статус: open.

Зачем: цена должна быть точной.

Риск: расхождение цены ломает доверие и заявку.

Reconciliation note: остаётся открытой, потому что pricing audit фиксирует риск расхождения client/server pricing, а API completion report прямо указывает, что P0-13 остаётся открытой отдельной задачей.

Объём: M. Зависимости: price sources, delivery, assembly, P0-13. Независимо: частично.

### P0-04 Checkout Reliability

Статус: duplicate / partially covered by P0-11 and P0-12.

Зачем: заявка должна стабильно отправляться с корректными данными.

Риск: потеря конверсии и заявок.

Reconciliation note: contract-scope закрыт через P0-11/P0-12. Остаточный browser-level checkout UX/E2E scope остаётся в P1-05 и P1-09.

### P0-05 Three.js Stability

Статус: open.

Зачем: 3D является основным интерфейсом.

Риск: пользователь видит сломанный продукт.

Объём: XL. Зависимости: scene adapter, state model. Независимо: нет.

### P0-06 WebGL / 2D Fallback

Статус: open.

Зачем: пользователь должен продолжить настройку, если WebGL недоступен.

Риск: часть пользователей не сможет отправить заявку.

Объём: M. Зависимости: P0-05. Независимо: нет.

### P0-07 Documentation Sync

Статус: in progress.

Зачем: единый источник истины для агентов.

Риск: агенты читают устаревшие документы.

Reconciliation note: backlog обновлён, reconciliation report создан. Master plan и roadmap всё ещё требуют отдельной аккуратной актуализации после подтверждения новой priority matrix.

Объём: M. Зависимости: audits, backlog. Независимо: да.

### P0-08 Testing Foundation

Статус: duplicate / partially covered by P0-09, P0-10, P0-11, P0-12, P0-14, P0-19.

Зачем: минимальная защита от регрессий.

Риск: крупная декомпозиция станет небезопасной.

Reconciliation note: базовая QA/CI/testing foundation закрыта инфраструктурно и contract-layer задачами. Остаточная работа по Fast/Medium/Heavy, nightly/release workflows и quarantine остаётся в P1-14—P1-19.

### P0-09 QA Fast CI Gate

Статус: closed.

Итог: GitHub QA gate включает install, typecheck, build, active constructor/pricing/production fast tests, coverage snapshot и architecture guards.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-10 Coverage & Thresholds

Статус: closed as baseline.

Итог: добавлен dependency-free V8 coverage snapshot; будущий upgrade — Istanbul/LCOV.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-11 API Order Flow Tests

Статус: closed.

Итог: API order flow покрыт в `tests/checkout-submit-hook.test.ts`: создание заявки, persistence contract, notification branches, validation/error branches и cooldown/rate-limit contract.

Доказательство: GitHub Actions QA run `27574702631` завершился `success`; `Fast active tests` включает `npm run test:checkout-submit-hook`.

Документ: `docs/api/api-contract-completion-report-v1.md`.

### P0-12 Checkout Submit Tests

Статус: closed.

Итог: checkout submit contract покрывает active Constructor3D submit source contract, validation, API success/failure handling, idempotency key, cooldown/no-reset guard, delivery и assembly validation.

Доказательство: GitHub Actions QA run `27574702631` завершился `success`; `Fast active tests` содержит `npm run test:checkout-submit-hook`.

Документ: `docs/api/api-contract-completion-report-v1.md`.

### P0-13 Pricing Golden Fixtures & Parity

Статус: open.

Зачем: гарантировать точную цену на клиенте и сервере.

Риск: расхождение стоимости.

Reconciliation note: не закрывать без отдельного pricing parity completion evidence. В репозитории найден pricing audit, который фиксирует риск расхождения client/server pricing; API completion report также указывает, что P0-13 остаётся открытой отдельной задачей.

Объём: L. Зависимости: P0-03, pricing sources, client/server parity fixtures.

### P0-14 Supabase Contract Tests

Статус: closed.

Итог: Supabase contract coverage включает deterministic env-missing behavior, insert mapping, client IP hashing, schema/RLS/static migration contract, admin order mapping и status event mapping.

Доказательство: GitHub Actions QA run `27574702631` завершился `success`.

Документ: `docs/api/api-contract-completion-report-v1.md`.

### P0-15 CI/CD & Vercel Failure Investigation

Статус: closed as investigation + preventive CI controls.

Ограничение: точная Vercel build error не подтверждена, потому что Vercel logs недоступны из GitHub-only интерфейса.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-16 Constructor Reset Contract Resolution

Статус: open.

Источник: `docs/constructor/reset-contract-verification-report-v1.md`.

Зачем: определить целевое поведение `reset()` и зафиксировать единый reset contract для constructor state.

Риск: constructor store и smoke tests могут проверять разные ожидания.

Reconciliation note: в репозитории не найден completion/fix report, подтверждающий закрытие P0-16. Последний найденный verification report фиксирует, что P0-16 не закрыта.

Closure condition: закрыть P0-16 можно только после подтверждённого успешного запуска typecheck, build и релевантных constructor tests, а также после документального решения reset contract.

### P0-17 Constructor Smoke Test Stabilization

Статус: open.

Источник: `docs/constructor/reset-contract-verification-report-v1.md`.

Зачем: привести smoke test к выбранному reset contract.

Риск: smoke test будет либо падать без продуктовой причины, либо перестанет защищать critical constructor flow.

Reconciliation note: в репозитории не найден completion/fix report, подтверждающий закрытие P0-17. Последний найденный verification report фиксирует, что P0-17 не закрыта и зависит от P0-16.

Closure condition: закрыть P0-17 можно только после подтверждённого успешного запуска constructor smoke/store tests.

### P0-18 Constructor3D Architecture Guard Implementation

Статус: open.

Источник: `docs/constructor/constructor-core-audit-v1.md` + `docs/planning/constructor3d-guard-spec-v1.md`.

Зачем: enforce active Constructor3D boundary against legacy imports, direct API/Supabase/admin/server imports and forbidden layer crossings.

Риск: агенты могут случайно вернуть legacy/runtime dependencies в активный Constructor3D.

Объём: M. Зависимости: P0-01, P0-02, P0-08. Независимо: частично.

### P0-19 Dependency Layer Recovery Verification

Статус: closed.

Источник: `docs/api/api-contract-completion-report-v1.md`.

Итог: GitHub Actions QA run `27574702631` подтвердил `npm ci`, typechecks, build, Fast active tests и `npm run test:checkout-submit-hook` через Node 22 runtime.

---

## P1 — MVP Quality

### P1-01 Constructor3D UX Completion

Статус: open. Задачи: выбор зон, локальное меню, наполнение, фасады, random preset. Зависимости: P0-02, P0-05.

### P1-02 Material System

Статус: open. Задачи: реальные текстуры, категории, swatches, zoom-preview. Зависимости: Three.js material pipeline, P0-05.

### P1-03 3D Furniture Details

Статус: open. Задачи: петли, направляющие, ручки, штанги, базовая фурнитура.

### P1-04 Warning / Error System

Статус: open. Задачи: warning, blocking warning, error, auto-fix для простых случаев.

### P1-05 Checkout UX Completion

Статус: open. Задачи: итоговая смета, доставка, сборка, контакты, согласие, success state.

### P1-06 Legacy Constructor Cleanup Plan

Статус: open. Задачи: миграция тестов, quarantine, безопасное удаление после подтверждения.

### P1-07 CI/CD Quality Gates

Статус: duplicate / partially covered by P0-09 and P0-19. Остаточный release/deploy readiness scope живёт в P1-14, P1-15 и P1-18.

### P1-08 Design System Stabilization

Статус: open. Задачи: tokens, buttons, forms, cards, focus states, spacing.

### P1-09 Constructor3D Submit E2E

Статус: open. Задачи: полноценные Playwright сценарии оформления заявки.

### P1-10 WebGL Fallback E2E

Статус: open. Задачи: принудительная проверка fallback при отказе WebGL.

### P1-11 Production Golden Snapshots

Статус: open. Задачи: детерминированные снапшоты production model/export.

### P1-12 Admin API & Integration Tests

Статус: open. Задачи: прямое тестирование admin API и статусов.

### P1-13 Material / Texture Parity Tests

Статус: open. Задачи: соответствие материалов UI, pricing и 3D.

### P1-14 Nightly QA Workflow

Статус: open. Задачи: отдельный nightly pipeline для medium tests, Playwright smoke, bundle report и расширенной coverage публикации.

### P1-15 Release QA Workflow

Статус: open. Задачи: отдельный release pipeline для full Playwright matrix, Vercel preview smoke, Supabase validation, production snapshots и release readiness checks.

### P1-16 Package Scripts Ownership / Fast-Medium-Heavy Test Separation

Статус: open. Задачи: разделить scripts на `test:fast`, `test:medium`, `test:heavy`, `qa:release` и зафиксировать ownership.

### P1-17 Istanbul / LCOV Coverage Upgrade

Статус: open. Задачи: заменить baseline V8 byte coverage на Istanbul/LCOV line/branch/function coverage.

### P1-18 Deployment Validation Layer

Статус: open. Задачи: добавить слой deployment validation между GitHub Actions и Vercel.

### P1-19 Test Quarantine System

Статус: open. Задачи: официальный quarantine-механизм для unstable/flaky tests.

### P1-20 Constructor Advanced / Scene State Contract Cleanup

Статус: open. Задачи: зафиксировать ownership для advanced flags и scene render mode перед дальнейшей декомпозицией Constructor3D. Зависимости: P0-02, P0-16.

### P1-21 Reset Action Separation

Статус: open. Задачи: разделить именование reset-действий. Зависимости: P0-16, P0-17.

---

## P2 — Production-Ready Depth

1. Production Model Decomposition — open.
2. Manufacturing Rules Engine — open.
3. Basis Export JSON — open.
4. Admin Orders — open.
5. Admin Production Panel — open.
6. Production Revisions — open.
7. Operation editor for hinges/guides/drilling — open.
8. Detailed production warnings — open.
9. Visual regression testing — open.
10. Cross-browser testing matrix — open.
11. Property-based state testing — open.
12. Vercel preview deployment smoke after deployment status — open.

---

## P3 — Post-MVP

1. AI Assembly System — open.
2. B2B Mode — open.
3. Kitchens — open.
4. Automatic `.b3d` generation — open.
5. Cinematic assembly animation — open.
6. Deep Three.js optimization — open.
7. CRM/logistics integration — open.
8. Full PDF binary generation — open.
9. Real email attachments — open.
10. Full mobile E2E matrix — open.
11. Automated performance budgets — open.

---

## Consolidated temporary backlog files

Следующие временные backlog-файлы были перенесены в этот документ и не должны использоваться как active backlog:

- `docs/planning/backlog-followups-test-infrastructure-v1.md` → archived as `docs/archive/planning/backlog-followups-test-infrastructure-v1.md`.
