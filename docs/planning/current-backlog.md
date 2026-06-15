# Current Backlog — Размерно

Статус: единый operational backlog для агентов.

Этот документ является **единственным источником истины по активным backlog-задачам**. Временные backlog-followup документы после переноса задач должны архивироваться или удаляться из active planning layer.

Формат приоритета:

- P0 — блокирует безопасный MVP.
- P1 — требуется для качественного MVP.
- P2 — усиливает production-ready уровень.
- P3 — post-MVP.

---

## P0 — Critical MVP Safety

### P0-01 Unified Constructor Architecture

Зачем: зафиксировать Constructor3D как активную ветку, а legacy Constructor — как quarantine.

Риск: агенты будут менять старый код или дублировать логику.

Объём: XL. Зависимости: architecture audit. Независимо: нет.

### P0-02 Constructor State Model Stabilization

Зачем: единая модель данных для размеров, секций, зон, наполнения, фасадов, материалов, checkout и validation.

Риск: ломается связь UI, 3D, fallback, pricing и checkout.

Объём: L. Зависимости: P0-01. Независимо: нет.

### P0-03 Pricing Engine Validation

Зачем: цена должна быть точной.

Риск: расхождение цены ломает доверие и заявку.

Объём: M. Зависимости: price sources, delivery, assembly. Независимо: частично.

### P0-04 Checkout Reliability

Зачем: заявка должна стабильно отправляться с корректными данными.

Риск: потеря конверсии и заявок.

Объём: M. Зависимости: pricing, validation, order API. Независимо: частично.

### P0-05 Three.js Stability

Зачем: 3D является основным интерфейсом.

Риск: пользователь видит сломанный продукт.

Объём: XL. Зависимости: scene adapter, state model. Независимо: нет.

### P0-06 WebGL / 2D Fallback

Зачем: пользователь должен продолжить настройку, если WebGL недоступен.

Риск: часть пользователей не сможет отправить заявку.

Объём: M. Зависимости: P0-05. Независимо: нет.

### P0-07 Documentation Sync

Зачем: единый источник истины для агентов.

Риск: агенты читают устаревшие документы.

Объём: M. Зависимости: audits, backlog. Независимо: да.

### P0-08 Testing Foundation

Зачем: минимальная защита от регрессий.

Риск: крупная декомпозиция станет небезопасной.

Объём: L. Зависимости: стабильные границы модулей. Независимо: частично.

### P0-09 QA Fast CI Gate

Статус: закрыто инфраструктурно.

Зачем: сделать тесты обязательной частью CI.

Риск: регрессии проходят в main несмотря на существующие тесты.

Итог: GitHub QA gate включает install, typecheck, build, active constructor/pricing/production fast tests, coverage snapshot и architecture guards.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-10 Coverage & Thresholds

Статус: закрыто как baseline.

Зачем: измеряемое качество тестов.

Риск: невозможно понимать реальное покрытие.

Итог: добавлен dependency-free V8 coverage snapshot; будущий upgrade — Istanbul/LCOV.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-11 API Order Flow Tests

Статус: закрыто.

Зачем: защитить критический сценарий создания заявки.

Риск: поломка заказов в production.

Итог: API order flow покрыт в `tests/checkout-submit-hook.test.ts`: создание заявки, persistence contract, manager/customer notification branches, validation/error branches и request cooldown/rate-limit contract.

Доказательство: GitHub Actions QA run `27574702631` завершился `success`; шаги `Install dependencies`, `Typecheck frontend`, `Typecheck API`, `Build frontend` и `Fast active tests` прошли. В `.github/workflows/qa.yml` шаг `Fast active tests` включает `npm run test:checkout-submit-hook`.

Документ: `docs/api/api-contract-completion-report-v1.md`.

### P0-12 Checkout Submit Tests

Статус: закрыто.

Зачем: проверить success/error/cooldown сценарии.

Риск: потеря заявок и конверсии.

Итог: checkout submit contract покрывает active Constructor3D submit source contract, customer validation, API success/failure handling, idempotency key, cooldown/no-reset guard, delivery и assembly validation.

Доказательство: GitHub Actions QA run `27574702631` завершился `success`; `Fast active tests` прошёл и содержит `npm run test:checkout-submit-hook`.

Документ: `docs/api/api-contract-completion-report-v1.md`.

### P0-13 Pricing Golden Fixtures & Parity

Зачем: гарантировать точную цену на клиенте и сервере.

Риск: расхождение стоимости.

Объём: L.

### P0-14 Supabase Contract Tests

Статус: закрыто.

Зачем: защитить схему БД, миграции и политики.

Риск: скрытые ошибки данных и безопасности.

Итог: Supabase contract coverage включает deterministic env-missing repository behavior, insert mapping, client IP hashing, schema/RLS/static migration contract, admin order mapping и status event mapping.

Доказательство: GitHub Actions QA run `27574702631` завершился `success`; `Fast active tests` прошёл и содержит `npm run test:checkout-submit-hook`.

Документ: `docs/api/api-contract-completion-report-v1.md`.

### P0-15 CI/CD & Vercel Failure Investigation

Статус: закрыто как investigation + preventive CI controls; точная Vercel build error не подтверждена, потому что Vercel logs недоступны из текущего GitHub-only интерфейса.

Зачем: устранить текущие сбои пайплайна.

Риск: невозможность доверять релизам.

Документ: `docs/qa/test-infrastructure-report-v1.md`.

### P0-16 Constructor Reset Contract Resolution

Статус: implementation applied; closure pending real `typecheck`, `build` and constructor test evidence.

Источник: перенесено из `docs/planning/backlog-followups-test-infrastructure-v1.md`; уточнено в `docs/constructor/constructor-core-audit-v1.md`; повторно проверено в `docs/constructor/reset-contract-verification-report-v1.md`; исправление описано в `docs/constructor/reset-contract-fix-report-v2.md`.

Ответственный: Constructor Core Agent.

Зачем: определить целевое поведение `reset()` и зафиксировать единый reset contract для constructor state.

Риск: `constructorStore.test.ts` и `constructorFlowSmoke.test.ts` проверяли разные ожидания, что делало smoke-тесты нестабильными.

Implementation finding: `reset()` переведён на full project reset по `constructorInitialState`: сбрасываются размеры, секции, зоны, наполнение, материалы, validation, checkout/contact/service fields, step и store-level transient state.

Closure condition: закрыть P0-16 можно только после подтверждённого успешного запуска `npm run typecheck`, `npm run build` и релевантных constructor tests.

Объём: M. Зависимости: P0-02, P0-08. Независимо: частично.

### P0-17 Constructor Smoke Test Stabilization

Статус: implementation applied; closure pending real `typecheck`, `build` and constructor test evidence.

Источник: перенесено из `docs/planning/backlog-followups-test-infrastructure-v1.md`; уточнено в `docs/constructor/constructor-core-audit-v1.md`; повторно проверено в `docs/constructor/reset-contract-verification-report-v1.md`; исправление описано в `docs/constructor/reset-contract-fix-report-v2.md`.

Ответственный: Constructor Core Agent.

Зачем: привести `constructorFlowSmoke.test.ts` к текущему поведению constructor state/reset contract после решения P0-16.

Риск: smoke test будет либо падать без продуктовой причины, либо перестанет защищать critical constructor flow.

Implementation finding: `constructorFlowSmoke.test.ts` синхронизирован с full project reset и дополнительно проверяет очистку consent, deliveryEnabled и assemblyEnabled.

Closure condition: закрыть P0-17 можно только после подтверждённого успешного запуска constructor smoke/store tests.

Объём: M. Зависимости: P0-16. Независимо: нет.

### P0-18 Constructor3D Architecture Guard Implementation

Источник: `docs/constructor/constructor-core-audit-v1.md` + `docs/planning/constructor3d-guard-spec-v1.md`.

Ответственный: Architecture Guard Agent.

Зачем: enforce active Constructor3D boundary (`src/static-pages/Constructor3DPage.tsx`, `src/static-pages/constructor/**`) against legacy imports, direct API/Supabase/admin/server imports and forbidden layer crossings.

Риск: агенты могут случайно вернуть legacy constructor/runtime dependencies в активный Constructor3D.

Объём: M. Зависимости: P0-01, P0-02, P0-08. Независимо: частично.

### P0-19 Dependency Layer Recovery Verification

Статус: закрыто.

Источник: `docs/qa/fast-active-tests-recovery-report-v1.md`; финальное подтверждение: `docs/api/api-contract-completion-report-v1.md`.

Ответственный: Test Infrastructure / Dependency Recovery Agent.

Зачем: подтвердить, что dependency/runtime слой CI стабилен для install, typecheck, build и Fast active tests после восстановления Node/Supabase-compatible runtime.

Риск: GitHub Actions может проходить install/typecheck/build, но падать в runtime-зависимом contract test из-за несовместимой Node/runtime конфигурации.

Итог: GitHub Actions QA run `27574702631` подтвердил `npm ci`, `npm run typecheck`, `npm run typecheck:api`, `npm run build`, `Fast active tests` и `npm run test:checkout-submit-hook` через Node 22 runtime.

Объём: M. Зависимости: P0-09, P0-11, P0-12, P0-14. Независимо: частично.

---

## P1 — MVP Quality

### P1-01 Constructor3D UX Completion

Задачи: выбор зон, локальное меню, наполнение, фасады, random preset. Объём: XL. Зависимости: P0-02, P0-05.

### P1-02 Material System

Задачи: реальные текстуры, категории, swatches, zoom-preview. Объём: L. Зависимости: Three.js material pipeline.

### P1-03 3D Furniture Details

Задачи: петли, направляющие, ручки, штанги, базовая фурнитура. Объём: XL. Зависимости: hardware model, scene architecture.

### P1-04 Warning / Error System

Задачи: warning, blocking warning, error, auto-fix для простых случаев. Объём: M. Зависимости: validation model.

### P1-05 Checkout UX Completion

Задачи: итоговая смета, доставка, сборка, контакты, согласие, success state. Объём: M. Зависимости: pricing, order flow.

### P1-06 Legacy Constructor Cleanup Plan

Задачи: миграция тестов, quarantine, безопасное удаление после подтверждения. Объём: L. Зависимости: tests.

### P1-07 CI/CD Quality Gates

Задачи: typecheck, build, tests as required checks. Объём: M. Зависимости: package scripts.

### P1-08 Design System Stabilization

Задачи: tokens, buttons, forms, cards, focus states, spacing. Объём: L. Зависимости: актуальный UI scope.

### P1-09 Constructor3D Submit E2E

Задачи: полноценные Playwright сценарии оформления заявки.

### P1-10 WebGL Fallback E2E

Задачи: принудительная проверка fallback при отказе WebGL.

### P1-11 Production Golden Snapshots

Задачи: детерминированные снапшоты production model/export.

### P1-12 Admin API & Integration Tests

Задачи: прямое тестирование admin API и статусов.

### P1-13 Material / Texture Parity Tests

Задачи: соответствие материалов UI, pricing и 3D.

### P1-14 Nightly QA Workflow

Задачи: отдельный nightly pipeline для medium tests, Playwright smoke, bundle report и расширенной coverage публикации.

Источник: `docs/qa/test-infrastructure-report-v1.md`; подтверждено временным follow-up backlog. Приоритет сохранён как P1, а не P2, чтобы не понижать QA-критичность.

### P1-15 Release QA Workflow

Задачи: отдельный release pipeline для full Playwright matrix, Vercel preview smoke, Supabase validation, production snapshots и release readiness checks.

Источник: `docs/qa/test-infrastructure-report-v1.md`; подтверждено временным follow-up backlog. Приоритет сохранён как P1, а не P2, чтобы не понижать release-критичность.

### P1-16 Package Scripts Ownership / Fast-Medium-Heavy Test Separation

Источник: `docs/qa/test-infrastructure-report-v1.md` + `docs/planning/backlog-followups-test-infrastructure-v1.md`.

Задачи: разделить scripts на `test:fast`, `test:medium`, `test:heavy`, `qa:release`; зафиксировать ownership и legacy deprecation plan; финализировать разделение тестов на Fast, Medium и Heavy и использовать это разделение в CI.

### P1-17 Istanbul / LCOV Coverage Upgrade

Задачи: заменить baseline V8 byte coverage на production-grade Istanbul/LCOV line/branch/function coverage и PR summary comment.

Источник: `docs/qa/test-infrastructure-report-v1.md`.

### P1-18 Deployment Validation Layer

Источник: перенесено из `docs/planning/backlog-followups-test-infrastructure-v1.md`.

Ответственный: Infrastructure Agent.

Задачи: добавить слой deployment validation между GitHub Actions и Vercel, чтобы typecheck/build/fast tests выполнялись до деплоя и были явно связаны с release/deploy readiness.

Риск: Vercel deployment может падать или расходиться с GitHub QA без раннего blocking-сигнала.

Зависимости: P0-09, P1-07, P1-15.

### P1-19 Test Quarantine System

Источник: перенесено из `docs/planning/backlog-followups-test-infrastructure-v1.md`.

Ответственный: Infrastructure Agent.

Задачи: добавить официальный quarantine-механизм для unstable/flaky tests, чтобы они не скрывались, не удалялись без решения и не ломали весь pipeline без маркировки.

Риск: flaky tests будут либо блокировать разработку, либо неформально отключаться без следа в документации.

Зависимости: P0-08, P1-16.

### P1-20 Constructor Advanced / Scene State Contract Cleanup

Источник: `docs/constructor/constructor-core-audit-v1.md`.

Ответственный: Constructor Core Agent.

Задачи: зафиксировать и покрыть тестами ownership для `exactModeEnabled`, `advancedSizes`, `advancedFill`, store-level `sceneRenderMode` и page-local render mode перед дальнейшей декомпозицией Constructor3D.

Риск: будущие агенты могут принять mirrored flags или local/store scene mode за независимые источники истины и создать расхождение состояния.

Зависимости: P0-02, P0-16.

### P1-21 Reset Action Separation

Источник: `docs/constructor/reset-contract-fix-report-v2.md`.

Ответственный агент: Constructor Core Agent.

Описание: разделить именование reset-действий, чтобы ручной `reset()` всегда означал full project reset, а возможный будущий сценарий configuration reset preserving checkout был доступен только как отдельное явно названное действие.

Зависимости: P0-16, P0-17.

---

## P2 — Production-Ready Depth

1. Production Model Decomposition.
2. Manufacturing Rules Engine.
3. Basis Export JSON.
4. Admin Orders.
5. Admin Production Panel.
6. Production Revisions.
7. Operation editor for hinges/guides/drilling.
8. Detailed production warnings.
9. Visual regression testing.
10. Cross-browser testing matrix.
11. Property-based state testing.
12. Vercel preview deployment smoke after deployment status.

---

## P3 — Post-MVP

1. AI Assembly System.
2. B2B Mode.
3. Kitchens.
4. Automatic `.b3d` generation.
5. Cinematic assembly animation.
6. Deep Three.js optimization.
7. CRM/logistics integration.
8. Full PDF binary generation.
9. Real email attachments.
10. Full mobile E2E matrix.
11. Automated performance budgets.

---

## Consolidated temporary backlog files

Следующие временные backlog-файлы были перенесены в этот документ и не должны использоваться как active backlog:

- `docs/planning/backlog-followups-test-infrastructure-v1.md` → archived as `docs/archive/planning/backlog-followups-test-infrastructure-v1.md`.
